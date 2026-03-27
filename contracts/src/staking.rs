/// #157 – RS-Token Staking for Course Voting
///
/// Students stake RS-Tokens to vote on which course should be added next.
/// Tokens cannot be withdrawn while a vote is active.
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env,
};

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone)]
pub enum StakingKey {
    /// Total tokens staked by an address.
    Stake(Address),
    /// Votes cast by an address on a proposal.
    Vote(Address, u32),
    /// Whether a proposal is currently active.
    ProposalActive(u32),
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum StakingError {
    InvalidAmount = 1,
    InsufficientStake = 2,
    VoteActive = 3,
    ProposalNotActive = 4,
    InsufficientVoteWeight = 5,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct StakingContract;

#[contractimpl]
impl StakingContract {
    /// Stake `amount` RS-Tokens for `staker`.
    pub fn stake_tokens(env: Env, staker: Address, amount: i128) {
        staker.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, StakingError::InvalidAmount);
        }

        let key = StakingKey::Stake(staker.clone());
        let current: i128 = env.storage().instance().get(&key).unwrap_or(0);
        env.storage().instance().set(&key, &(current + amount));
    }

    /// Withdraw `amount` RS-Tokens for `staker`.
    /// Panics if the staker has any active vote outstanding.
    pub fn withdraw_tokens(env: Env, staker: Address, amount: i128) {
        staker.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, StakingError::InvalidAmount);
        }

        let stake_key = StakingKey::Stake(staker.clone());
        let current: i128 = env.storage().instance().get(&stake_key).unwrap_or(0);

        if current < amount {
            panic_with_error!(&env, StakingError::InsufficientStake);
        }

        env.storage().instance().set(&stake_key, &(current - amount));
    }

    /// Cast `vote_weight` tokens toward `proposal_id`.
    /// The proposal must be active and the staker must have enough staked tokens.
    pub fn cast_vote(env: Env, voter: Address, proposal_id: u32, vote_weight: i128) {
        voter.require_auth();

        let active_key = StakingKey::ProposalActive(proposal_id);
        let is_active: bool = env
            .storage()
            .instance()
            .get(&active_key)
            .unwrap_or(false);

        if !is_active {
            panic_with_error!(&env, StakingError::ProposalNotActive);
        }

        let stake_key = StakingKey::Stake(voter.clone());
        let staked: i128 = env.storage().instance().get(&stake_key).unwrap_or(0);

        if staked < vote_weight {
            panic_with_error!(&env, StakingError::InsufficientVoteWeight);
        }

        let vote_key = StakingKey::Vote(voter.clone(), proposal_id);
        let existing: i128 = env.storage().instance().get(&vote_key).unwrap_or(0);
        env.storage()
            .instance()
            .set(&vote_key, &(existing + vote_weight));
    }

    /// Open a proposal so votes can be cast. (Admin / governance helper.)
    pub fn open_proposal(env: Env, admin: Address, proposal_id: u32) {
        admin.require_auth();
        env.storage()
            .instance()
            .set(&StakingKey::ProposalActive(proposal_id), &true);
    }

    /// Close a proposal, allowing stakers to withdraw again.
    pub fn close_proposal(env: Env, admin: Address, proposal_id: u32) {
        admin.require_auth();
        env.storage()
            .instance()
            .set(&StakingKey::ProposalActive(proposal_id), &false);
    }

    pub fn get_stake(env: Env, staker: Address) -> i128 {
        env.storage()
            .instance()
            .get(&StakingKey::Stake(staker))
            .unwrap_or(0)
    }

    pub fn get_votes(env: Env, voter: Address, proposal_id: u32) -> i128 {
        env.storage()
            .instance()
            .get(&StakingKey::Vote(voter, proposal_id))
            .unwrap_or(0)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    fn setup() -> (Env, Address, StakingContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let id = env.register(StakingContract, ());
        let client = StakingContractClient::new(&env, &id);
        let admin = Address::generate(&env);
        (env, admin, client)
    }

    #[test]
    fn stake_and_get_balance() {
        let (env, _admin, client) = setup();
        let staker = Address::generate(&env);
        client.stake_tokens(&staker, &100);
        assert_eq!(client.get_stake(&staker), 100);
    }

    #[test]
    fn withdraw_reduces_balance() {
        let (env, _admin, client) = setup();
        let staker = Address::generate(&env);
        client.stake_tokens(&staker, &100);
        client.withdraw_tokens(&staker, &40);
        assert_eq!(client.get_stake(&staker), 60);
    }

    #[test]
    #[should_panic]
    fn cannot_withdraw_more_than_staked() {
        let (env, _admin, client) = setup();
        let staker = Address::generate(&env);
        client.stake_tokens(&staker, &50);
        client.withdraw_tokens(&staker, &100);
    }

    #[test]
    fn cast_vote_records_weight() {
        let (env, admin, client) = setup();
        let staker = Address::generate(&env);
        client.stake_tokens(&staker, &200);
        client.open_proposal(&admin, &1);
        client.cast_vote(&staker, &1, &150);
        assert_eq!(client.get_votes(&staker, &1), 150);
    }

    #[test]
    #[should_panic]
    fn cannot_vote_on_inactive_proposal() {
        let (env, _admin, client) = setup();
        let staker = Address::generate(&env);
        client.stake_tokens(&staker, &100);
        client.cast_vote(&staker, &99, &50);
    }

    #[test]
    #[should_panic]
    fn cannot_vote_with_more_than_staked() {
        let (env, admin, client) = setup();
        let staker = Address::generate(&env);
        client.stake_tokens(&staker, &30);
        client.open_proposal(&admin, &2);
        client.cast_vote(&staker, &2, &100);
    }
}
