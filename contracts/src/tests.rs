use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Events, Ledger},
    vec, Address, BytesN, Env, FromVal, String, Symbol,
};

fn setup() -> (
    Env,
    Address,
    Address,
    Address,
    CertificateContractClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CertificateContract, ());
    let client = CertificateContractClient::new(&env, &contract_id);
    let admin_a = Address::generate(&env);
    let admin_b = Address::generate(&env);
    let admin_c = Address::generate(&env);
    client.init(&admin_a, &admin_b, &admin_c);
    (env, admin_a, admin_b, admin_c, client)
}

fn propose_and_approve_mint_cap(
    client: &CertificateContractClient<'_>,
    proposer: &Address,
    co_signer: &Address,
    cap: u32,
) {
    let id = client.propose_action(proposer, &PendingAdminAction::SetMintCap(cap));
    client.approve_action(co_signer, &id);
}

#[test]
fn issues_and_loads_certificate_successfully() {
    let (env, instructor, _, _, client) = setup();

    env.ledger().with_mut(|ledger| ledger.timestamp = 1_234);

    let course_symbol = symbol_short!("SOLID");
    let student = Address::generate(&env);
    let course_name = String::from_str(&env, "Rust 101");

    let issued = client.issue(
        &instructor,
        &course_symbol,
        &vec![&env, student.clone()],
        &course_name,
    );

    assert_eq!(issued.len(), 1);
    let cert = issued.get(0).unwrap();
    assert_eq!(cert.course_symbol, course_symbol);
    assert_eq!(cert.student, student);
    assert_eq!(cert.course_name, course_name);
    assert_eq!(cert.issue_date, 1_234);
    assert!(!cert.revoked);

    let stored = client.get_certificate(&course_symbol, &student);
    assert_eq!(stored, Some(cert));
}

#[test]
fn returns_none_for_non_existent_certificate() {
    let (env, _a, _b, _c, client) = setup();

    let course_symbol = symbol_short!("MISSIN");
    let student = Address::generate(&env);
    assert!(client.get_certificate(&course_symbol, &student).is_none());
}

#[test]
fn issues_multiple_students_in_one_call() {
    let (env, instructor, _, _, client) = setup();

    env.ledger().with_mut(|ledger| ledger.timestamp = 5_000);

    let course_symbol = symbol_short!("MULTI");
    let course_name = String::from_str(&env, "Web3 Basics");
    let student_a = Address::generate(&env);
    let student_b = Address::generate(&env);
    let student_c = Address::generate(&env);

    let students = vec![
        &env,
        student_a.clone(),
        student_b.clone(),
        student_c.clone(),
    ];
    let issued = client.issue(&instructor, &course_symbol, &students, &course_name);

    assert_eq!(issued.len(), 3);

    for student in [&student_a, &student_b, &student_c] {
        let cert = client.get_certificate(&course_symbol, student).unwrap();
        assert_eq!(cert.student, *student);
        assert_eq!(cert.issue_date, 5_000);
        assert!(!cert.revoked);
    }
}

#[test]
fn each_student_gets_unique_storage_key() {
    let (env, instructor, _, _, client) = setup();

    let course_symbol = symbol_short!("UNIQ");
    let course_name = String::from_str(&env, "Soroban 101");
    let student_a = Address::generate(&env);
    let student_b = Address::generate(&env);

    client.issue(
        &instructor,
        &course_symbol,
        &vec![&env, student_a.clone(), student_b.clone()],
        &course_name,
    );

    let cert_a = client.get_certificate(&course_symbol, &student_a).unwrap();
    let cert_b = client.get_certificate(&course_symbol, &student_b).unwrap();
    assert_ne!(cert_a.student, cert_b.student);
}

#[test]
fn verifies_event_emitted_per_student() {
    let (env, instructor, _, _, client) = setup();

    let course_symbol = symbol_short!("SOLID");
    let course_name = String::from_str(&env, "Rust 101");
    let student_a = Address::generate(&env);
    let student_b = Address::generate(&env);

    client.issue(
        &instructor,
        &course_symbol,
        &vec![&env, student_a.clone(), student_b.clone()],
        &course_name,
    );

    let all_events = env.events().all();
    let mut cert_issued_count = 0u32;
    for (addr, topics, _) in all_events.iter() {
        if addr == client.address
            && Symbol::from_val(&env, &topics.get(0).unwrap()) == Symbol::new(&env, "cert_issued")
        {
            cert_issued_count += 1;
        }
    }

    assert_eq!(cert_issued_count, 2);
}

#[test]
fn admin_can_revoke_certificate() {
    let (env, admin, _, _, client) = setup();

    let course_symbol = symbol_short!("SOLID");
    let student = Address::generate(&env);
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(
        &admin,
        &course_symbol,
        &vec![&env, student.clone()],
        &course_name,
    );
    client.revoke(&admin, &course_symbol, &student);

    let cert = client.get_certificate(&course_symbol, &student).unwrap();
    assert!(cert.revoked);
}

#[test]
fn revoke_does_not_affect_other_students() {
    let (env, admin, _, _, client) = setup();

    let course_symbol = symbol_short!("SOLID");
    let course_name = String::from_str(&env, "Rust 101");
    let student_a = Address::generate(&env);
    let student_b = Address::generate(&env);

    client.issue(
        &admin,
        &course_symbol,
        &vec![&env, student_a.clone(), student_b.clone()],
        &course_name,
    );

    client.revoke(&admin, &course_symbol, &student_a);

    assert!(
        client
            .get_certificate(&course_symbol, &student_a)
            .unwrap()
            .revoked
    );
    assert!(
        !client
            .get_certificate(&course_symbol, &student_b)
            .unwrap()
            .revoked
    );
}

#[test]
fn revoke_emits_event() {
    let (env, admin, _, _, client) = setup();

    let course_symbol = symbol_short!("SOLID");
    let student = Address::generate(&env);
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(
        &admin,
        &course_symbol,
        &vec![&env, student.clone()],
        &course_name,
    );
    client.revoke(&admin, &course_symbol, &student);

    let (addr, topics, _data) = env.events().all().last().unwrap();
    assert_eq!(addr, client.address);
    assert_eq!(
        Symbol::from_val(&env, &topics.get(0).unwrap()),
        Symbol::new(&env, "cert_revoked")
    );
    assert_eq!(
        Symbol::from_val(&env, &topics.get(1).unwrap()),
        course_symbol
    );
}

#[test]
#[should_panic]
fn non_admin_cannot_revoke_certificate() {
    let (env, admin, _, _, client) = setup();

    let course_symbol = symbol_short!("SOLID");
    let student = Address::generate(&env);
    let course_name = String::from_str(&env, "Rust 101");

    client.issue(
        &admin,
        &course_symbol,
        &vec![&env, student.clone()],
        &course_name,
    );

    let attacker = Address::generate(&env);
    client.revoke(&attacker, &course_symbol, &student);
}

// ---------------------------------------------------------------------------
// Meta-transactions
// ---------------------------------------------------------------------------

#[test]
fn meta_tx_issues_certificate_for_student() {
    let (env, admin, _, _, client) = setup();

    env.ledger().with_mut(|l| l.timestamp = 9_000);

    let course_symbol = symbol_short!("META");
    let student = Address::generate(&env);
    let course_name = String::from_str(&env, "Meta Course");

    let call_data = MetaTxCallData {
        instructor: admin.clone(),
        course_symbol: course_symbol.clone(),
        student: student.clone(),
        course_name: course_name.clone(),
        nonce: 0,
    };

    let sig = BytesN::from_array(&env, &[0u8; 64]);
    let cert = client.execute_meta_tx(&sig, &call_data);

    assert_eq!(cert.student, student);
    assert_eq!(cert.course_symbol, course_symbol);
    assert_eq!(cert.issue_date, 9_000);
    assert!(!cert.revoked);

    assert_eq!(client.get_certificate(&course_symbol, &student), Some(cert));
}

#[test]
fn meta_tx_nonce_increments_after_execution() {
    let (env, admin, _, _, client) = setup();

    let call_data = MetaTxCallData {
        instructor: admin.clone(),
        course_symbol: symbol_short!("NONCE"),
        student: Address::generate(&env),
        course_name: String::from_str(&env, "Nonce Test"),
        nonce: 0,
    };

    assert_eq!(client.get_nonce(&admin), 0);
    let sig = BytesN::from_array(&env, &[0u8; 64]);
    client.execute_meta_tx(&sig, &call_data);
    assert_eq!(client.get_nonce(&admin), 1);
}

#[test]
#[should_panic(expected = "invalid nonce")]
fn meta_tx_replay_is_rejected() {
    let (env, admin, _, _, client) = setup();

    let call_data = MetaTxCallData {
        instructor: admin.clone(),
        course_symbol: symbol_short!("REPLY"),
        student: Address::generate(&env),
        course_name: String::from_str(&env, "Replay Test"),
        nonce: 0,
    };

    let sig = BytesN::from_array(&env, &[0u8; 64]);
    client.execute_meta_tx(&sig, &call_data.clone());
    client.execute_meta_tx(&sig, &call_data);
}

#[test]
#[should_panic]
fn meta_tx_non_instructor_is_rejected() {
    let (env, _a, _b, _c, client) = setup();

    let attacker = Address::generate(&env);
    let call_data = MetaTxCallData {
        instructor: attacker.clone(),
        course_symbol: symbol_short!("HACK"),
        student: Address::generate(&env),
        course_name: String::from_str(&env, "Hack Attempt"),
        nonce: 0,
    };

    let sig = BytesN::from_array(&env, &[0u8; 64]);
    client.execute_meta_tx(&sig, &call_data);
}

#[test]
fn meta_tx_emits_event() {
    let (env, admin, _, _, client) = setup();

    let course_symbol = symbol_short!("EVNT");
    let call_data = MetaTxCallData {
        instructor: admin.clone(),
        course_symbol: course_symbol.clone(),
        student: Address::generate(&env),
        course_name: String::from_str(&env, "Event Test"),
        nonce: 0,
    };

    let sig = BytesN::from_array(&env, &[0u8; 64]);
    client.execute_meta_tx(&sig, &call_data);

    let (addr, topics, _) = env.events().all().last().unwrap();
    assert_eq!(addr, client.address);
    assert_eq!(
        Symbol::from_val(&env, &topics.get(0).unwrap()),
        Symbol::new(&env, "meta_tx_issued")
    );
}

// ---------------------------------------------------------------------------
// Mint caps (2-of-3 multisig)
// ---------------------------------------------------------------------------

#[test]
fn get_default_mint_cap() {
    let (_env, admin, _, _, client) = setup();

    let mint_cap = client.get_mint_cap(&admin);
    assert_eq!(mint_cap, 1000);
}

#[test]
#[should_panic]
fn non_admin_cannot_get_mint_cap() {
    let (env, _a, _b, _c, client) = setup();

    let attacker = Address::generate(&env);
    client.get_mint_cap(&attacker);
}

#[test]
fn admin_can_set_mint_cap_via_multisig() {
    let (_env, admin_a, admin_b, _, client) = setup();

    propose_and_approve_mint_cap(&client, &admin_a, &admin_b, 500);

    let mint_cap = client.get_mint_cap(&admin_a);
    assert_eq!(mint_cap, 500);
}

#[test]
#[should_panic]
fn non_admin_cannot_propose_mint_cap() {
    let (env, _a, _b, _c, client) = setup();

    let attacker = Address::generate(&env);
    client.propose_action(&attacker, &PendingAdminAction::SetMintCap(500));
}

#[test]
#[should_panic]
fn cannot_set_zero_mint_cap_via_multisig() {
    let (_env, admin_a, admin_b, _, client) = setup();

    propose_and_approve_mint_cap(&client, &admin_a, &admin_b, 0);
}

#[test]
#[should_panic]
fn mint_cap_exceeded_reverts() {
    let (env, admin_a, admin_b, _, client) = setup();

    propose_and_approve_mint_cap(&client, &admin_a, &admin_b, 2);

    let course_symbol = symbol_short!("CAP1");
    let course_name = String::from_str(&env, "Test Course");

    let student1 = Address::generate(&env);
    let student2 = Address::generate(&env);
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, student1.clone(), student2.clone()],
        &course_name,
    );

    let student3 = Address::generate(&env);
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, student3.clone()],
        &course_name,
    );
}

#[test]
fn get_mint_stats() {
    let (env, admin_a, admin_b, _, client) = setup();

    propose_and_approve_mint_cap(&client, &admin_a, &admin_b, 100);

    let course_symbol = symbol_short!("STAT");
    let course_name = String::from_str(&env, "Stats Course");
    let student1 = Address::generate(&env);
    let student2 = Address::generate(&env);
    let student3 = Address::generate(&env);
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, student1.clone(), student2.clone(), student3.clone()],
        &course_name,
    );

    let (period, minted, cap, remaining) = client.get_mint_stats(&admin_a);

    assert_eq!(minted, 3);
    assert_eq!(cap, 100);
    assert_eq!(remaining, 97);
    assert_eq!(period, 0);
}

#[test]
#[should_panic]
fn non_admin_cannot_get_mint_stats() {
    let (env, _a, _b, _c, client) = setup();

    let attacker = Address::generate(&env);
    client.get_mint_stats(&attacker);
}

#[test]
#[should_panic]
fn multiple_issues_respect_mint_cap() {
    let (env, admin_a, admin_b, _, client) = setup();

    propose_and_approve_mint_cap(&client, &admin_a, &admin_b, 5);

    let course_symbol = symbol_short!("MULT");
    let course_name = String::from_str(&env, "Multi Issue Course");

    let student1 = Address::generate(&env);
    let student2 = Address::generate(&env);
    let student3 = Address::generate(&env);
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, student1.clone(), student2.clone(), student3.clone()],
        &course_name,
    );

    let student4 = Address::generate(&env);
    let student5 = Address::generate(&env);
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, student4.clone(), student5.clone()],
        &course_name,
    );

    let student6 = Address::generate(&env);
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, student6.clone()],
        &course_name,
    );
}

#[test]
fn mint_cap_update_emits_event() {
    let (env, admin_a, admin_b, _, client) = setup();

    propose_and_approve_mint_cap(&client, &admin_a, &admin_b, 250);

    let all_events = env.events().all();
    let mut found_event = false;
    for (addr, topics, _) in all_events.iter() {
        if addr == client.address
            && Symbol::from_val(&env, &topics.get(0).unwrap())
                == Symbol::new(&env, "mint_cap_updated")
        {
            found_event = true;
        }
    }
    assert!(found_event);
}

#[test]
fn issue_emits_mint_period_update_event() {
    let (env, instructor, _, _, client) = setup();

    let course_symbol = symbol_short!("EVNT");
    let course_name = String::from_str(&env, "Event Course");
    let student1 = Address::generate(&env);
    let student2 = Address::generate(&env);

    client.issue(
        &instructor,
        &course_symbol,
        &vec![&env, student1.clone(), student2.clone()],
        &course_name,
    );

    let all_events = env.events().all();
    let mut found_event = false;
    for (addr, topics, _) in all_events.iter() {
        if addr == client.address
            && Symbol::from_val(&env, &topics.get(0).unwrap())
                == Symbol::new(&env, "mint_period_update")
        {
            found_event = true;
        }
    }
    assert!(found_event);
}

// ---------------------------------------------------------------------------
// RBAC, pause, multisig surface
// ---------------------------------------------------------------------------

#[test]
fn governance_address_has_admin_role() {
    let (_env, admin_a, _, _, client) = setup();
    assert!(client.has_role(&admin_a, &Role::Admin));
}

#[test]
#[should_panic]
fn issue_without_instructor_role_fails() {
    let (env, admin_a, _, _, client) = setup();

    let student_only = Address::generate(&env);
    client.grant_role(&admin_a, &student_only, &Role::Student);

    let course_symbol = symbol_short!("RBAC");
    let course_name = String::from_str(&env, "RBAC");
    client.issue(
        &student_only,
        &course_symbol,
        &vec![&env, Address::generate(&env)],
        &course_name,
    );
}

#[test]
#[should_panic]
fn pause_blocks_issue() {
    let (env, admin_a, _, _, client) = setup();

    client.set_paused(&admin_a, &true);

    let course_symbol = symbol_short!("PAUS");
    let course_name = String::from_str(&env, "Paused");
    client.issue(
        &admin_a,
        &course_symbol,
        &vec![&env, Address::generate(&env)],
        &course_name,
    );
}

#[test]
fn third_admin_can_be_final_approver() {
    let (_env, admin_a, _admin_b, admin_c, client) = setup();

    let id = client.propose_action(&admin_a, &PendingAdminAction::SetMintCap(42));
    client.approve_action(&admin_c, &id);

    assert_eq!(client.get_mint_cap(&admin_a), 42);
}
