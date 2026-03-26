use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env,
};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    CertificateContract,
    Balance(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum TokenError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    InvalidAmount = 3,
}

#[contract]
pub struct RsTokenContract;

#[contractimpl]
impl RsTokenContract {
    /// Stores the certificate contract address allowed to mint RS-Tokens.
    pub fn init(env: Env, certificate_contract: Address) {
        if env.storage().instance().has(&DataKey::CertificateContract) {
            panic_with_error!(&env, TokenError::AlreadyInitialized);
        }

        env.storage()
            .instance()
            .set(&DataKey::CertificateContract, &certificate_contract);
    }

    /// Mints non-transferable RS-Tokens to a student.
    /// Only the configured certificate contract address may call this.
    pub fn mint(env: Env, caller: Address, student: Address, amount: i128) {
        caller.require_auth();

        let certificate_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::CertificateContract)
            .unwrap();

        if caller != certificate_contract {
            panic_with_error!(&env, TokenError::NotAuthorized);
        }

        if amount <= 0 {
            panic_with_error!(&env, TokenError::InvalidAmount);
        }

        let balance_key = DataKey::Balance(student);
        let current_balance: i128 = env.storage().instance().get(&balance_key).unwrap_or(0);
        env.storage()
            .instance()
            .set(&balance_key, &(current_balance + amount));
    }

    pub fn get_balance(env: Env, student: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(student))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn mints_balance_for_student_when_called_by_certificate_contract() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, RsTokenContract);
        let client = RsTokenContractClient::new(&env, &contract_id);

        let certificate_contract = Address::generate(&env);
        let student = Address::generate(&env);

        client.init(&certificate_contract);
        client.mint(&certificate_contract, &student, &25);

        assert_eq!(client.get_balance(&student), 25);
    }

    #[test]
    #[should_panic]
    fn rejects_mint_from_non_certificate_contract() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, RsTokenContract);
        let client = RsTokenContractClient::new(&env, &contract_id);

        let certificate_contract = Address::generate(&env);
        let unauthorized = Address::generate(&env);
        let student = Address::generate(&env);

        client.init(&certificate_contract);
        client.mint(&unauthorized, &student, &10);
    }
}
