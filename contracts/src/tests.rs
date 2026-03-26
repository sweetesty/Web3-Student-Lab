use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Events, Ledger},
    Env, FromVal, String, Symbol,
};

#[test]
fn issues_and_loads_certificate_successfully() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CertificateContract);
    let client = CertificateContractClient::new(&env, &contract_id);

    env.ledger().with_mut(|ledger| ledger.timestamp = 1_234);

    let symbol = symbol_short!("SOLID");
    let student = String::from_str(&env, "Ada Lovelace");
    let course_name = String::from_str(&env, "Rust 101");

    let issued = client.issue(&symbol, &student, &course_name);

    assert_eq!(
        issued,
        Certificate {
            symbol: symbol.clone(),
            student,
            course_name,
            issue_date: 1_234,
        }
    );

    let stored = client.get_certificate(&symbol);
    assert_eq!(stored, Some(issued));
}

#[test]
fn returns_none_for_non_existent_certificate() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CertificateContract);
    let client = CertificateContractClient::new(&env, &contract_id);

    let symbol = symbol_short!("MISSIN");

    let stored = client.get_certificate(&symbol);
    assert!(stored.is_none());
}

#[test]
fn verifies_event_emission_on_issue() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CertificateContract);
    let client = CertificateContractClient::new(&env, &contract_id);

    let symbol = symbol_short!("SOLID");
    let student = String::from_str(&env, "Ada Lovelace");
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(&symbol, &student, &course_name);

    let (addr, topics, data) = env.events().all().last().unwrap();
    assert_eq!(addr, contract_id);

    assert_eq!(
        Symbol::from_val(&env, &topics.get(0).unwrap()),
        Symbol::new(&env, "cert_issued")
    );
    assert_eq!(Symbol::from_val(&env, &topics.get(1).unwrap()), symbol);

    let event_data: (String, String) = FromVal::from_val(&env, &data);
    assert_eq!(event_data.0, student);
    assert_eq!(event_data.1, course_name);
}
