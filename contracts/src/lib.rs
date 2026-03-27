#![no_std]

pub mod fuzz;
pub mod token;

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

/// W3C-compliant Decentralized Identifier (DID) stored for each student.
/// Format: did:soroban:{stellar_address}
/// This allows certificates to be linked to a verifiable, self-sovereign identity.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StudentDid {
    pub student: Address,
    pub did: String,
    pub updated_at: u64,
}

/// Composite storage key: one entry per (course, student) pair.
#[contracttype]
#[derive(Clone)]
pub struct CertKey {
    pub course_symbol: Symbol,
    pub student: Address,
}

/// Storage keys for the CertificateContract
#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    MintCap,
    MintedThisPeriod,
    CurrentPeriod,
    StudentDid(Address), // Maps student address to their DID
}

/// Error types for CertificateContract
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
}

const DEFAULT_MINT_CAP: u32 = 1000;
const LEDGERS_PER_PERIOD: u32 = 17280; // Approximately 24 hours (5 second close time)

const ADMIN_KEY: &str = "admin";

#[contract]
pub struct CertificateContract;

#[contractimpl]
impl CertificateContract {
    /// Initialize the contract with an administrator address.
    /// Must be called once before any other function.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, CertError::AlreadyInitialized);
        }
        env.storage()
            .instance()
            .set(&DataKey::Admin, &admin);

        // Initialize minting cap with default value
        env.storage()
            .instance()
            .set(&DataKey::MintCap, &DEFAULT_MINT_CAP);

        // Initialize mint tracking for the current period
        let current_ledger = env.ledger().sequence();
        env.storage()
            .instance()
            .set(&DataKey::MintedThisPeriod, &0u32);
        env.storage()
            .instance()
            .set(&DataKey::CurrentPeriod, &(current_ledger / LEDGERS_PER_PERIOD));
    }

    /// Check and update mint tracking for the current ledger period.
    /// Returns the number of certificates that can still be minted this period.
    /// Resets the counter if we've moved to a new period.
    fn check_and_update_mint_tracking(env: &Env) -> u32 {
        let current_ledger = env.ledger().sequence();
        let current_period = current_ledger / LEDGERS_PER_PERIOD;

        let stored_period: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CurrentPeriod)
            .unwrap_or(0);

        // If we've moved to a new period, reset the counter
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

    /// Record minting activity, updating the counter for the current period.
    /// Panics if the mint cap would be exceeded.
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

    /// Issue certificates to one or more students for a course in a single transaction.
    /// Each student gets a unique certificate stored under (course_symbol, student) key.
    /// A `cert_issued` event is emitted for every certificate.
    ///
    /// This function enforces the minting cap per ledger period to prevent runaway inflation.
    pub fn issue(
        env: Env,
        course_symbol: Symbol,
        students: Vec<Address>,
        course_name: String,
    ) -> Vec<Certificate> {
        let student_count = students.len();

        // Check if we have enough mint capacity for all students
        let available = Self::check_and_update_mint_tracking(&env);
        if (student_count as u32) > available {
            panic_with_error!(&env, CertError::MintCapExceeded);
        }

        // Record the minting activity
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

        // Emit event with minting info for transparency
        env.events().publish(
            Symbol::new(&env, "mint_period_update"),
            (
                env.ledger().sequence() / LEDGERS_PER_PERIOD,
                student_count as u32,
            ),
        );

        issued
    }

    /// Revoke a certificate by course symbol and student address.
    /// Only callable by the administrator.
    pub fn revoke(env: Env, caller: Address, course_symbol: Symbol, student: Address) {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialized");

        if caller != admin {
            panic_with_error!(&env, CertError::Unauthorized);
        }

        let key = CertKey {
            course_symbol: course_symbol.clone(),
            student: student.clone(),
        };

        let mut cert: Certificate = env
            .storage()
            .instance()
            .get(&key)
            .expect_with_error(&env, CertError::CertificateNotFound);

        cert.revoked = true;
        env.storage().instance().set(&key, &cert);

        env.events().publish(
            (Symbol::new(&env, "cert_revoked"), course_symbol),
            (caller, student),
        );
    }

    /// Retrieve a certificate by course symbol and student address.
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

    /// Get the current minting cap per ledger period.
    /// Only callable by the administrator.
    pub fn get_mint_cap(env: Env, caller: Address) -> u32 {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();

        if caller != admin {
            panic_with_error!(&env, CertError::Unauthorized);
        }

        env.storage()
            .instance()
            .get(&DataKey::MintCap)
            .unwrap_or(DEFAULT_MINT_CAP)
    }

    /// Set a new minting cap per ledger period.
    /// Only callable by the administrator.
    ///
    /// # Arguments
    /// * `caller` - The administrator address calling this function
    /// * `new_cap` - The new minting cap value (must be > 0)
    pub fn set_mint_cap(env: Env, caller: Address, new_cap: u32) {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();

        if caller != admin {
            panic_with_error!(&env, CertError::Unauthorized);
        }

        if new_cap == 0 {
            panic_with_error!(&env, CertError::InvalidMintCap);
        }

        let old_cap: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MintCap)
            .unwrap_or(DEFAULT_MINT_CAP);

        env.storage()
            .instance()
            .set(&DataKey::MintCap, &new_cap);

        // Emit event for transparency
        env.events().publish(
            Symbol::new(&env, "mint_cap_updated"),
            (old_cap, new_cap),
        );
    }

    /// Get current minting statistics for the period.
    /// Returns (current_period, minted_this_period, mint_cap, remaining_capacity)
    /// Only callable by the administrator.
    pub fn get_mint_stats(env: Env, caller: Address) -> (u32, u32, u32, u32) {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();

        if caller != admin {
            panic_with_error!(&env, CertError::Unauthorized);
        }

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

    /// Update the DID for the calling student address.
    /// Implements W3C DID standard with Soroban method: did:soroban:{stellar_address}
    ///
    /// Requirements:
    /// - Caller must authenticate (require_auth)
    /// - DID must start with "did:soroban:" prefix (W3C compliant format)
    ///
    /// # Arguments
    /// * `caller` - The student address calling this function (must match caller authentication)
    /// * `did` - The new W3C-compliant DID string (format: did:soroban:{address})
    pub fn update_did(env: Env, caller: Address, did: String) {
        caller.require_auth();

        // Validate DID format: must start with "did:soroban:"
        let prefix = String::from_str(&env, "did:soroban:");
        if !did.starts_with(&prefix) {
            panic_with_error!(&env, CertError::InvalidDid);
        }

        let timestamp = env.ledger().timestamp();

        // Store the DID
        let student_did = StudentDid {
            student: caller.clone(),
            did: did.clone(),
            updated_at: timestamp,
        };

        env.storage()
            .instance()
            .set(&DataKey::StudentDid(caller.clone()), &student_did);

        // Emit DID update event
        env.events().publish(
            Symbol::new(&env, "did_updated"),
            (caller.clone(), did.clone(), timestamp),
        );
    }

    /// Retrieve the DID for a student address.
    ///
    /// # Arguments
    /// * `student` - The student address to look up
    ///
    /// # Returns
    /// * `Option<StudentDid>` - The student's DID if it exists
    pub fn get_did(env: Env, student: Address) -> Option<StudentDid> {
        env.storage()
            .instance()
            .get(&DataKey::StudentDid(student))
    }

    /// Remove a student's DID (for privacy/compliance scenarios).
    /// Only callable by the administrator.
    ///
    /// # Arguments
    /// * `caller` - The administrator address calling this function
    /// * `student` - The student address whose DID should be removed
    pub fn remove_did(env: Env, caller: Address, student: Address) {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialized");

        if caller != admin {
            panic_with_error!(&env, CertError::Unauthorized);
        }

        // Check if DID exists
        let existing_did: Option<StudentDid> = env
            .storage()
            .instance()
            .get(&DataKey::StudentDid(student.clone()));

        if existing_did.is_none() {
            panic_with_error!(&env, CertError::DidNotFound);
        }

        // Remove the DID
        env.storage()
            .instance()
            .remove(&DataKey::StudentDid(student.clone()));

        // Emit DID removal event
        env.events().publish(
            Symbol::new(&env, "did_removed"),
            (caller, student),
        );
    }
}

#[cfg(test)]
mod tests;
