use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Events, Ledger},
    Address, Env, FromVal, String, Symbol,
};

fn setup() -> (Env, Address, CertificateContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CertificateContract, ());
    let client = CertificateContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.init(&admin);
    (env, admin, client)
}

#[test]
fn issues_and_loads_certificate_successfully() {
    let (env, _admin, client) = setup();

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
            revoked: false,
        }
    );

    let stored = client.get_certificate(&symbol);
    assert_eq!(stored, Some(issued));
}

#[test]
fn returns_none_for_non_existent_certificate() {
    let (_env, _admin, client) = setup();

    let symbol = symbol_short!("MISSIN");
    assert!(client.get_certificate(&symbol).is_none());
}

#[test]
fn verifies_event_emission_on_issue() {
    let (env, _admin, client) = setup();

    let symbol = symbol_short!("SOLID");
    let student = String::from_str(&env, "Ada Lovelace");
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(&symbol, &student, &course_name);

    let (addr, topics, data) = env.events().all().last().unwrap();
    assert_eq!(addr, client.address);

    assert_eq!(
        Symbol::from_val(&env, &topics.get(0).unwrap()),
        Symbol::new(&env, "cert_issued")
    );
    assert_eq!(Symbol::from_val(&env, &topics.get(1).unwrap()), symbol);

    let event_data: (String, String) = FromVal::from_val(&env, &data);
    assert_eq!(event_data.0, student);
    assert_eq!(event_data.1, course_name);
}

#[test]
fn admin_can_revoke_certificate() {
    let (env, admin, client) = setup();

    let symbol = symbol_short!("SOLID");
    let student = String::from_str(&env, "Ada Lovelace");
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(&symbol, &student, &course_name);

    client.revoke(&admin, &symbol);

    let cert = client.get_certificate(&symbol).unwrap();
    assert!(cert.revoked);
}

#[test]
fn revoke_emits_event() {
    let (env, admin, client) = setup();

    let symbol = symbol_short!("SOLID");
    let student = String::from_str(&env, "Ada Lovelace");
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(&symbol, &student, &course_name);
    client.revoke(&admin, &symbol);

    let (addr, topics, _data) = env.events().all().last().unwrap();
    assert_eq!(addr, client.address);
    assert_eq!(
        Symbol::from_val(&env, &topics.get(0).unwrap()),
        Symbol::new(&env, "cert_revoked")
    );
    assert_eq!(Symbol::from_val(&env, &topics.get(1).unwrap()), symbol);
}

#[test]
#[should_panic(expected = "unauthorized")]
fn non_admin_cannot_revoke_certificate() {
    let (env, _admin, client) = setup();

    let symbol = symbol_short!("SOLID");
    let student = String::from_str(&env, "Ada Lovelace");
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(&symbol, &student, &course_name);

    let attacker = Address::generate(&env);
    client.revoke(&attacker, &symbol);
}
