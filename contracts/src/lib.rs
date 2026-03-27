#![no_std]

pub mod token;

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Certificate {
    pub symbol: Symbol,
    pub student: String,
    pub course_name: String,
    pub issue_date: u64,
    pub revoked: bool,
}

const ADMIN_KEY: &str = "admin";

#[contract]
pub struct CertificateContract;

#[contractimpl]
impl CertificateContract {
    /// Initialize the contract with an administrator address.
    /// Must be called once before any other function.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, ADMIN_KEY)) {
            panic!("already initialized");
        }
        env.storage()
            .instance()
            .set(&Symbol::new(&env, ADMIN_KEY), &admin);
    }

    /// Issue a new certificate to a student for a specific course.
    pub fn issue(env: Env, symbol: Symbol, student: String, course_name: String) -> Certificate {
        let issue_date = env.ledger().timestamp();

        let cert = Certificate {
            symbol: symbol.clone(),
            student: student.clone(),
            course_name: course_name.clone(),
            issue_date,
            revoked: false,
        };

        env.storage().instance().set(&symbol, &cert);

        env.events().publish(
            (Symbol::new(&env, "cert_issued"), symbol),
            (student, course_name),
        );

        cert
    }

    /// Revoke a certificate by its symbol. Only callable by the administrator.
    pub fn revoke(env: Env, caller: Address, symbol: Symbol) {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, ADMIN_KEY))
            .expect("contract not initialized");

        if caller != admin {
            panic!("unauthorized: only the admin can revoke certificates");
        }

        let mut cert: Certificate = env
            .storage()
            .instance()
            .get(&symbol)
            .expect("certificate not found");

        cert.revoked = true;
        env.storage().instance().set(&symbol, &cert);

        env.events().publish(
            (Symbol::new(&env, "cert_revoked"), symbol),
            caller,
        );
    }

    /// Retrieve a certificate by its symbol.
    pub fn get_certificate(env: Env, symbol: Symbol) -> Option<Certificate> {
        env.storage().instance().get(&symbol)
    }
}

#[cfg(test)]
mod tests;
