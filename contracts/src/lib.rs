#![no_std]

pub mod token;

use soroban_sdk::{contract, contractimpl, contracttype, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Certificate {
    pub symbol: Symbol,
    pub student: String,
    pub course_name: String,
    pub issue_date: u64,
}

#[contract]
pub struct CertificateContract;

#[contractimpl]
impl CertificateContract {
    /// Issue a new certificate to a student for a specific course with a custom symbol.
    pub fn issue(env: Env, symbol: Symbol, student: String, course_name: String) -> Certificate {
        let issue_date = env.ledger().timestamp();

        let cert = Certificate {
            symbol: symbol.clone(),
            student: student.clone(),
            course_name: course_name.clone(),
            issue_date,
        };

        env.storage().instance().set(&symbol, &cert);

        // Emit Soroban Event
        env.events().publish(
            (Symbol::new(&env, "cert_issued"), symbol),
            (student, course_name),
        );

        cert
    }

    /// Retrieve a certificate by its symbol.
    pub fn get_certificate(env: Env, symbol: Symbol) -> Option<Certificate> {
        env.storage().instance().get(&symbol)
    }
}

#[cfg(test)]
mod tests;
