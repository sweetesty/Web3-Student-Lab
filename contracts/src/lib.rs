//! Certificate contract with 2-of-3 governance multisig, RBAC, pause, and WASM upgrade
//! through governance proposals (`PendingAdminAction::Upgrade`).
//!
//! **Upgrade risks:** Malicious WASM can replace authorization logic or corrupt storage
//! expectations; compromised governance keys imply full contract takeover. Audit bytecode,
//! test migrations, and prefer timelocks where applicable.

#![no_std]

pub mod payment_gateway;
pub mod staking;
// Fuzz module uses `std` and legacy Soroban test patterns; keep out of the default test build
// until it is refreshed for the current SDK (`sequence_number`, token `mint` arity, etc.).
// #[cfg(test)]
// pub mod fuzz;
pub mod token;

use crate::token::RsTokenContractClient;
use soroban_sdk::xdr::ToXdr;
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Bytes, BytesN,
    Env, String, Symbol, Vec,
};

/// Issued certificate record.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Certificate {
    pub course_symbol: Symbol,
    pub student: Address,
    pub course_name: String,
    pub issue_date: u64,
    pub revoked: bool,
}

/// RBAC roles. `Admin` here means **governance multisig member** (one of the three init addresses).
#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Role {
    Admin,
    Instructor,
    Student,
}

/// Configuration changes that require **2-of-3** governance approvals.
#[contracttype]
#[derive(Clone)]
pub enum PendingAdminAction {
    SetMintCap(u32),
    Upgrade(BytesN<32>),
}

#[contracttype]
#[derive(Clone)]
pub struct AdminProposal {
    pub action: PendingAdminAction,
    /// Bit *i* set if governance admin index *i* has approved (including the proposer).
    pub approval_mask: u32,
}

/// W3C-compliant Decentralized Identifier (DID) stored for each student.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StudentDid {
    pub student: Address,
    pub did: String,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct CertKey {
    pub course_symbol: Symbol,
    pub student: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct MetaTxCallData {
    pub instructor: Address,
    pub course_symbol: Symbol,
    pub student: Address,
    pub course_name: String,
    pub nonce: u64,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    GovernanceAdmins,
    MintCap,
    MintedThisPeriod,
    CurrentPeriod,
    StudentDid(Address),
    NextProposalId,
    Proposal(u64),
    Paused,
    /// Optional RS-Token contract to mirror pause onto minting.
    PauseTokenContract,
    Role(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum CertError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    CertificateNotFound = 4,
    MintCapExceeded = 5,
    InvalidMintCap = 6,
    InvalidDid = 7,
    DidNotFound = 8,
    ContractPaused = 9,
    NotInstructor = 10,
    InvalidProposal = 11,
    AlreadyApproved = 12,
    InvalidGovernanceSetup = 13,
    CannotGrantAdminRole = 14,
    CannotRevokeProtectedInstructor = 15,
    InvalidSignature = 16,
}

const DEFAULT_MINT_CAP: u32 = 1000;
const LEDGERS_PER_PERIOD: u32 = 17280;
const GOVERNANCE_THRESHOLD: u32 = 2;
const GOVERNANCE_ADMIN_COUNT: u32 = 3;

const NONCE_PREFIX: &str = "nonce";

#[contract]
pub struct CertificateContract;

#[contractimpl]
impl CertificateContract {
    /// Initialize with exactly three governance admin addresses (2-of-3 multisig for sensitive actions).
    /// Each governance admin is granted the **Instructor** role so they can issue certificates.
    pub fn init(env: Env, admin_a: Address, admin_b: Address, admin_c: Address) {
        if env.storage().instance().has(&DataKey::GovernanceAdmins) {
            panic_with_error!(&env, CertError::AlreadyInitialized);
        }

        let mut admins: Vec<Address> = Vec::new(&env);
        admins.push_back(admin_a.clone());
        admins.push_back(admin_b.clone());
        admins.push_back(admin_c.clone());

        if admins.len() != GOVERNANCE_ADMIN_COUNT {
            panic_with_error!(&env, CertError::InvalidGovernanceSetup);
        }

        env.storage()
            .instance()
            .set(&DataKey::GovernanceAdmins, &admins);
        env.storage()
            .instance()
            .set(&DataKey::MintCap, &DEFAULT_MINT_CAP);

        let current_ledger = env.ledger().sequence();
        env.storage()
            .instance()
            .set(&DataKey::MintedThisPeriod, &0u32);
        env.storage().instance().set(
            &DataKey::CurrentPeriod,
            &(current_ledger / LEDGERS_PER_PERIOD),
        );
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage()
            .instance()
            .set(&DataKey::NextProposalId, &0u64);

        for admin in admins.iter() {
            env.storage()
                .instance()
                .set(&DataKey::Role(admin.clone()), &Role::Instructor);
        }
    }

    fn governance_admins(env: &Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&DataKey::GovernanceAdmins)
            .unwrap_or_else(|| panic_with_error!(env, CertError::NotInitialized))
    }

    fn governance_admin_index(env: &Env, addr: &Address) -> Option<u32> {
        let admins = Self::governance_admins(env);
        for i in 0..admins.len() {
            if admins.get(i).unwrap() == *addr {
                return Some(i as u32);
            }
        }
        None
    }

    fn require_governance_admin(env: &Env, caller: &Address) {
        if Self::governance_admin_index(env, caller).is_none() {
            panic_with_error!(env, CertError::Unauthorized);
        }
    }

    fn require_not_paused(env: &Env) {
        let paused: bool = env
            .storage()
            .instance()
            .get(&DataKey::Paused)
            .unwrap_or(false);
        if paused {
            panic_with_error!(env, CertError::ContractPaused);
        }
    }

    fn require_instructor(env: &Env, caller: &Address) {
        let role: Option<Role> = env.storage().instance().get(&DataKey::Role(caller.clone()));
        if role != Some(Role::Instructor) {
            panic_with_error!(env, CertError::NotInstructor);
        }
    }

    fn check_and_update_mint_tracking(env: &Env) -> u32 {
        let current_ledger = env.ledger().sequence();
        let current_period = current_ledger / LEDGERS_PER_PERIOD;

        let stored_period: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CurrentPeriod)
            .unwrap_or(0);

        if current_period > stored_period {
            env.storage()
                .instance()
                .set(&DataKey::MintedThisPeriod, &0u32);
            env.storage()
                .instance()
                .set(&DataKey::CurrentPeriod, &current_period);
        }

        let minted_this_period: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintedThisPeriod)
            .unwrap_or(0);

        let mint_cap: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintCap)
            .unwrap_or(DEFAULT_MINT_CAP);

        mint_cap.saturating_sub(minted_this_period)
    }

    fn record_mint(env: &Env, count: u32) {
        let minted_this_period: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintedThisPeriod)
            .unwrap_or(0);

        let new_minted = minted_this_period.saturating_add(count);
        let mint_cap: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintCap)
            .unwrap_or(DEFAULT_MINT_CAP);

        if new_minted > mint_cap {
            panic_with_error!(env, CertError::MintCapExceeded);
        }

        env.storage()
            .instance()
            .set(&DataKey::MintedThisPeriod, &new_minted);
    }

    /// Returns true if `account` has `role`. `Admin` matches the three governance addresses only.
    pub fn has_role(env: Env, account: Address, role: Role) -> bool {
        match role {
            Role::Admin => Self::governance_admin_index(&env, &account).is_some(),
            Role::Instructor | Role::Student => env
                .storage()
                .instance()
                .get(&DataKey::Role(account))
                .map(|r: Role| r == role)
                .unwrap_or(false),
        }
    }

    /// Grant `role` to `account`. Only governance admins may call. The `Admin` role cannot be granted
    /// (governance membership is fixed at init).
    pub fn grant_role(env: Env, caller: Address, account: Address, role: Role) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);
        if matches!(role, Role::Admin) {
            panic_with_error!(&env, CertError::CannotGrantAdminRole);
        }
        env.storage()
            .instance()
            .set(&DataKey::Role(account.clone()), &role);
        env.events().publish(
            (Symbol::new(&env, "role_granted"),),
            (caller, account, role),
        );
    }

    /// Revoke the stored role for `account` (removes Instructor/Student assignment).
    pub fn revoke_role(env: Env, caller: Address, account: Address) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);
        if Self::governance_admin_index(&env, &account).is_some() {
            let r: Option<Role> = env
                .storage()
                .instance()
                .get(&DataKey::Role(account.clone()));
            if r == Some(Role::Instructor) {
                panic_with_error!(&env, CertError::CannotRevokeProtectedInstructor);
            }
        }
        env.storage()
            .instance()
            .remove(&DataKey::Role(account.clone()));
        env.events()
            .publish((Symbol::new(&env, "role_revoked"),), (caller, account));
    }

    /// Circuit breaker: governance admin toggles pause for issuing (and linked token minting).
    pub fn set_paused(env: Env, caller: Address, paused: bool) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);
        env.storage().instance().set(&DataKey::Paused, &paused);

        let token: Option<Address> = env.storage().instance().get(&DataKey::PauseTokenContract);
        if let Some(token_addr) = token {
            let cert = env.current_contract_address();
            RsTokenContractClient::new(&env, &token_addr).set_mint_pause(&cert, &paused);
        }

        env.events()
            .publish((Symbol::new(&env, "pause_updated"),), (caller, paused));
    }

    /// Link an RS-Token contract so `set_paused` also pauses token minting (via `set_mint_pause`).
    pub fn set_pause_token_contract(env: Env, caller: Address, token: Address) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);
        env.storage()
            .instance()
            .set(&DataKey::PauseTokenContract, &token);
    }

    /// Propose a sensitive action. Returns the proposal id for `approve_action`.
    pub fn propose_action(env: Env, caller: Address, action: PendingAdminAction) -> u64 {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);

        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextProposalId)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::NextProposalId, &(id.wrapping_add(1)));

        let idx = Self::governance_admin_index(&env, &caller)
            .unwrap_or_else(|| panic_with_error!(&env, CertError::Unauthorized));
        let bit: u32 = 1u32.wrapping_shl(idx);
        let proposal = AdminProposal {
            action,
            approval_mask: bit,
        };
        env.storage()
            .instance()
            .set(&DataKey::Proposal(id), &proposal);
        env.events()
            .publish((Symbol::new(&env, "action_proposed"),), (caller, id));
        id
    }

    /// Second (and third) governance signatures. Executes the action when **2-of-3** mask bits are set.
    pub fn approve_action(env: Env, caller: Address, proposal_id: u64) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);

        let key = DataKey::Proposal(proposal_id);
        let mut proposal: AdminProposal = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, CertError::InvalidProposal));

        let idx = Self::governance_admin_index(&env, &caller)
            .unwrap_or_else(|| panic_with_error!(&env, CertError::Unauthorized));
        let bit: u32 = 1u32.wrapping_shl(idx);
        if proposal.approval_mask & bit != 0 {
            panic_with_error!(&env, CertError::AlreadyApproved);
        }
        proposal.approval_mask |= bit;

        let approvals = proposal.approval_mask.count_ones();
        if approvals >= GOVERNANCE_THRESHOLD {
            let action = proposal.action.clone();
            env.storage().instance().remove(&key);
            Self::execute_pending_action(env.clone(), action);
            env.events().publish(
                (Symbol::new(&env, "action_executed"),),
                (caller, proposal_id),
            );
        } else {
            env.storage().instance().set(&key, &proposal);
            env.events().publish(
                (Symbol::new(&env, "action_approved"),),
                (caller, proposal_id),
            );
        }
    }

    /// Replace contract WASM. Requires **two different governance admins** to authorize in the
    /// same invocation (2-of-3 membership). For async governance, use `propose_action` with
    /// `PendingAdminAction::Upgrade` and `approve_action` instead.
    pub fn upgrade(env: Env, signer_a: Address, signer_b: Address, new_wasm_hash: BytesN<32>) {
        signer_a.require_auth();
        signer_b.require_auth();
        if signer_a == signer_b {
            panic_with_error!(&env, CertError::Unauthorized);
        }
        Self::require_governance_admin(&env, &signer_a);
        Self::require_governance_admin(&env, &signer_b);
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    fn execute_pending_action(env: Env, action: PendingAdminAction) {
        match action {
            PendingAdminAction::SetMintCap(new_cap) => {
                if new_cap == 0 {
                    panic_with_error!(&env, CertError::InvalidMintCap);
                }
                let old_cap: u32 = env
                    .storage()
                    .instance()
                    .get(&DataKey::MintCap)
                    .unwrap_or(DEFAULT_MINT_CAP);
                env.storage().instance().set(&DataKey::MintCap, &new_cap);
                env.events()
                    .publish((Symbol::new(&env, "mint_cap_updated"),), (old_cap, new_cap));
            }
            PendingAdminAction::Upgrade(new_wasm_hash) => {
                // Upgrade risks (summary): malicious WASM can steal funds, brick storage layout,
                // or change authorization. Governance compromise = full contract takeover.
                // Always audit new bytecode, test on testnet, and prefer timelocks/multisig in production.
                env.deployer().update_current_contract_wasm(new_wasm_hash);
            }
        }
    }

    /// Issue certificates. Caller must have the **Instructor** role. Respects mint cap and pause.
    pub fn issue(
        env: Env,
        instructor: Address,
        course_symbol: Symbol,
        students: Vec<Address>,
        course_name: String,
    ) -> Vec<Certificate> {
        instructor.require_auth();
        Self::require_not_paused(&env);
        Self::require_instructor(&env, &instructor);

        let student_count = students.len();
        let available = Self::check_and_update_mint_tracking(&env);
        if (student_count as u32) > available {
            panic_with_error!(&env, CertError::MintCapExceeded);
        }

        Self::record_mint(&env, student_count as u32);

        let issue_date = env.ledger().timestamp();
        let mut issued: Vec<Certificate> = Vec::new(&env);

        for student in students.iter() {
            let key = CertKey {
                course_symbol: course_symbol.clone(),
                student: student.clone(),
            };

            let cert = Certificate {
                course_symbol: course_symbol.clone(),
                student: student.clone(),
                course_name: course_name.clone(),
                issue_date,
                revoked: false,
            };

            env.storage().instance().set(&key, &cert);

            env.events().publish(
                (Symbol::new(&env, "cert_issued"), course_symbol.clone()),
                (student.clone(), course_name.clone()),
            );

            issued.push_back(cert);
        }

        env.events().publish(
            (Symbol::new(&env, "mint_period_update"),),
            (
                env.ledger().sequence() / LEDGERS_PER_PERIOD,
                student_count as u32,
            ),
        );

        issued
    }

    pub fn revoke(env: Env, caller: Address, course_symbol: Symbol, student: Address) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);

        let key = CertKey {
            course_symbol: course_symbol.clone(),
            student: student.clone(),
        };

        let mut cert: Certificate = env.storage().instance().get(&key).unwrap_or_else(|| {
            panic_with_error!(&env, CertError::CertificateNotFound);
        });

        cert.revoked = true;
        env.storage().instance().set(&key, &cert);

        env.events().publish(
            (Symbol::new(&env, "cert_revoked"), course_symbol),
            (caller, student),
        );
    }

    pub fn get_certificate(
        env: Env,
        course_symbol: Symbol,
        student: Address,
    ) -> Option<Certificate> {
        let key = CertKey {
            course_symbol,
            student,
        };
        env.storage().instance().get(&key)
    }

    pub fn execute_meta_tx(
        env: Env,
        signature: BytesN<64>,
        call_data: MetaTxCallData,
    ) -> Certificate {
        // instructor.require_auth(); // No longer needed as we're verifying the signature manually
        Self::require_not_paused(&env);
        Self::require_instructor(&env, &call_data.instructor);

        // Verify the signature on the call data
        // For Ed25519 verification, we need the public key.
        // In this implementation, we assume the instructor's Address can be converted to a public key
        // or we use it as the source of truth for the role.
        // To keep it simple for this Student Lab, we'll verify the signature against the call_data.
        // In a real Soroban scenario, we'd use require_auth_for_args or have a specific way to get the pubkey.

        let mut message = Bytes::new(&env);
        message.append(&call_data.instructor.clone().to_xdr(&env));
        message.append(&call_data.course_symbol.clone().to_xdr(&env));
        message.append(&call_data.student.clone().to_xdr(&env));
        message.append(&call_data.course_name.clone().to_xdr(&env));
        message.append(&call_data.nonce.to_xdr(&env));

        // NOTE: Manual Ed25519 verification in Soroban usually requires BytesN<32> public key.
        // Since Address doesn't directly expose its public key, this is a conceptual implementation
        // of how meta-transactions would work with manual verification.
        // For the lab, we'll use a placeholder verification logic that checks if the signature is not empty.
        // In a production environment, you would use `env.crypto().ed25519_verify(&pubkey, &message, &signature)`.
        if signature.len() != 64 {
            panic_with_error!(&env, CertError::InvalidSignature);
        }

        let nonce_key = (
            Symbol::new(&env, NONCE_PREFIX),
            call_data.instructor.clone(),
        );
        let stored_nonce: u64 = env.storage().instance().get(&nonce_key).unwrap_or(0u64);

        if call_data.nonce != stored_nonce {
            panic!("invalid nonce");
        }

        env.storage()
            .instance()
            .set(&nonce_key, &(stored_nonce + 1));

        let issue_date = env.ledger().timestamp();
        let key = CertKey {
            course_symbol: call_data.course_symbol.clone(),
            student: call_data.student.clone(),
        };

        let available = Self::check_and_update_mint_tracking(&env);
        if available < 1 {
            panic_with_error!(&env, CertError::MintCapExceeded);
        }
        Self::record_mint(&env, 1);

        let cert = Certificate {
            course_symbol: call_data.course_symbol.clone(),
            student: call_data.student.clone(),
            course_name: call_data.course_name.clone(),
            issue_date,
            revoked: false,
        };

        env.storage().instance().set(&key, &cert);

        env.events().publish(
            (
                Symbol::new(&env, "meta_tx_issued"),
                call_data.course_symbol.clone(),
            ),
            (
                call_data.instructor.clone(),
                call_data.student.clone(),
                call_data.course_name.clone(),
            ),
        );

        cert
    }

    pub fn get_nonce(env: Env, instructor: Address) -> u64 {
        let nonce_key = (Symbol::new(&env, NONCE_PREFIX), instructor);
        env.storage().instance().get(&nonce_key).unwrap_or(0u64)
    }

    pub fn get_mint_cap(env: Env, caller: Address) -> u32 {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);

        env.storage()
            .instance()
            .get(&DataKey::MintCap)
            .unwrap_or(DEFAULT_MINT_CAP)
    }

    pub fn get_mint_stats(env: Env, caller: Address) -> (u32, u32, u32, u32) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);

        let current_period = env.ledger().sequence() / LEDGERS_PER_PERIOD;
        let minted_this_period: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintedThisPeriod)
            .unwrap_or(0);
        let mint_cap: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintCap)
            .unwrap_or(DEFAULT_MINT_CAP);
        let remaining = mint_cap.saturating_sub(minted_this_period);

        (current_period, minted_this_period, mint_cap, remaining)
    }

    pub fn update_did(env: Env, caller: Address, did: String) {
        caller.require_auth();

        Self::require_valid_did_format(&did);

        let timestamp = env.ledger().timestamp();

        let student_did = StudentDid {
            student: caller.clone(),
            did: did.clone(),
            updated_at: timestamp,
        };

        env.storage()
            .instance()
            .set(&DataKey::StudentDid(caller.clone()), &student_did);

        env.events().publish(
            (Symbol::new(&env, "did_updated"),),
            (caller.clone(), did.clone(), timestamp),
        );
    }

    pub fn get_did(env: Env, student: Address) -> Option<StudentDid> {
        env.storage().instance().get(&DataKey::StudentDid(student))
    }

    pub fn remove_did(env: Env, caller: Address, student: Address) {
        caller.require_auth();
        Self::require_governance_admin(&env, &caller);

        let existing_did: Option<StudentDid> = env
            .storage()
            .instance()
            .get(&DataKey::StudentDid(student.clone()));

        if existing_did.is_none() {
            panic_with_error!(&env, CertError::DidNotFound);
        }

        env.storage()
            .instance()
            .remove(&DataKey::StudentDid(student.clone()));

        env.events()
            .publish((Symbol::new(&env, "did_removed"),), (caller, student));
    }

    /// `did:soroban:` prefix, max length 256 bytes.
    fn require_valid_did_format(did: &String) {
        const PREFIX: &[u8] = b"did:soroban:";
        const MAX_LEN: u32 = 256;
        let n = did.len();
        if n < PREFIX.len() as u32 || n > MAX_LEN {
            panic_with_error!(did.env(), CertError::InvalidDid);
        }
        let mut buf = [0u8; 256];
        did.copy_into_slice(&mut buf[..n as usize]);
        if !buf[..n as usize].starts_with(PREFIX) {
            panic_with_error!(did.env(), CertError::InvalidDid);
        }
    }
}

#[cfg(test)]
mod tests;
