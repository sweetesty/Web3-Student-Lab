use soroban_sdk::{
    contracttype, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SkillAttestation {
    pub skill_name: String,
    pub level: u32, // 1-5
    pub verifier: Address,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum SkillDataKey {
    UserSkills(Address),
    AuthorizedVerifier(Address),
}

pub struct SkillVerification;

impl SkillVerification {
    pub fn add_verifier(env: &Env, admin: Address, verifier: Address) {
        admin.require_auth();
        // Assume admin check happens in main contract
        env.storage().instance().set(&SkillDataKey::AuthorizedVerifier(verifier), &true);
    }

    pub fn attest_skill(env: &Env, verifier: Address, user: Address, skill_name: String, level: u32) {
        verifier.require_auth();
        
        let is_authorized: bool = env.storage().instance().get(&SkillDataKey::AuthorizedVerifier(verifier.clone())).unwrap_or(false);
        if !is_authorized { panic!("Not authorized verifier"); }

        let mut user_skills: Vec<SkillAttestation> = env.storage().persistent().get(&SkillDataKey::UserSkills(user.clone())).unwrap_or_else(|| Vec::new(env));
        
        // Update or add
        let mut found = false;
        for i in 0..user_skills.len() {
            if let Some(mut att) = user_skills.get(i) {
                if att.skill_name == skill_name {
                    att.level = level;
                    att.verifier = verifier.clone();
                    att.timestamp = env.ledger().timestamp();
                    user_skills.set(i, att);
                    found = true;
                    break;
                }
            }
        }

        if !found {
            user_skills.push_back(SkillAttestation {
                skill_name: skill_name.clone(),
                level,
                verifier: verifier.clone(),
                timestamp: env.ledger().timestamp(),
            });
        }

        env.storage().persistent().set(&SkillDataKey::UserSkills(user.clone()), &user_skills);

        env.events().publish(
            (Symbol::new(env, "skill_verified"), user, skill_name),
            level,
        );
    }

    pub fn get_user_skills(env: &Env, user: Address) -> Vec<SkillAttestation> {
        env.storage().persistent().get(&SkillDataKey::UserSkills(user)).unwrap_or_else(|| Vec::new(env))
    }

    pub fn verify_skill_requirement(env: &Env, user: Address, required_skill: String, min_level: u32) -> bool {
        let skills = Self::get_user_skills(env, user);
        for skill in skills.iter() {
            if skill.skill_name == required_skill && skill.level >= min_level {
                return true;
            }
        }
        false
    }
}
