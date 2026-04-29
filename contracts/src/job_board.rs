use soroban_sdk::{
    contracttype, Address, Env, String, Symbol, Vec, token,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum JobStatus {
    Open,
    InProgress,
    Completed,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub description: String,
    pub amount: i128,
    pub completed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Job {
    pub id: u64,
    pub employer: Address,
    pub freelancer: Option<Address>,
    pub title: String,
    pub description: String,
    pub budget: i128,
    pub milestones: Vec<Milestone>,
    pub required_skills: Vec<String>,
    pub status: JobStatus,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct JobApplication {
    pub job_id: u64,
    pub applicant: Address,
    pub proposal: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum JobDataKey {
    Job(u64),
    JobApplications(u64),
    NextJobId,
    EmployerJobs(Address),
    FreelancerJobs(Address),
    EscrowBalance(u64),
}

pub struct JobBoard;

impl JobBoard {
    pub fn create_job(
        env: &Env, 
        employer: Address, 
        title: String, 
        description: String, 
        budget: i128, 
        milestones: Vec<Milestone>,
        required_skills: Vec<String>,
        token_addr: Address
    ) -> u64 {
        employer.require_auth();

        // Escrow: Lock the full budget
        let client = token::Client::new(env, &token_addr);
        client.transfer(&employer, &env.current_contract_address(), &budget);

        let id: u64 = env.storage().instance().get(&JobDataKey::NextJobId).unwrap_or(0);
        let job = Job {
            id,
            employer: employer.clone(),
            freelancer: None,
            title,
            description,
            budget,
            milestones,
            required_skills,
            status: JobStatus::Open,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&JobDataKey::Job(id), &job);
        env.storage().instance().set(&JobDataKey::NextJobId, &(id + 1));
        env.storage().persistent().set(&JobDataKey::EscrowBalance(id), &budget);

        // Indexing
        let mut employer_jobs: Vec<u64> = env.storage().persistent().get(&JobDataKey::EmployerJobs(employer.clone())).unwrap_or_else(|| Vec::new(env));
        employer_jobs.push_back(id);
        env.storage().persistent().set(&JobDataKey::EmployerJobs(employer), &employer_jobs);

        env.events().publish(
            (Symbol::new(env, "job_created"), id, job.employer.clone()),
            job.budget,
        );

        id
    }

    pub fn apply_for_job(env: &Env, applicant: Address, job_id: u64, proposal: String) {
        applicant.require_auth();

        let mut apps: Vec<JobApplication> = env.storage().persistent().get(&JobDataKey::JobApplications(job_id)).unwrap_or_else(|| Vec::new(env));
        apps.push_back(JobApplication {
            job_id,
            applicant,
            proposal,
            timestamp: env.ledger().timestamp(),
        });
        env.storage().persistent().set(&JobDataKey::JobApplications(job_id), &apps);
    }

    pub fn hire_freelancer(env: &Env, employer: Address, job_id: u64, freelancer: Address) {
        employer.require_auth();

        let mut job: Job = env.storage().persistent().get(&JobDataKey::Job(job_id)).unwrap();
        if job.employer != employer { panic!("Not employer"); }
        if job.status != JobStatus::Open { panic!("Job not open"); }

        job.freelancer = Some(freelancer.clone());
        job.status = JobStatus::InProgress;
        env.storage().persistent().set(&JobDataKey::Job(job_id), &job);

        let mut freelancer_jobs: Vec<u64> = env.storage().persistent().get(&JobDataKey::FreelancerJobs(freelancer.clone())).unwrap_or_else(|| Vec::new(env));
        freelancer_jobs.push_back(job_id);
        env.storage().persistent().set(&JobDataKey::FreelancerJobs(freelancer), &freelancer_jobs);
    }

    pub fn complete_milestone(env: &Env, employer: Address, job_id: u64, milestone_idx: u32, token_addr: Address) {
        employer.require_auth();

        let mut job: Job = env.storage().persistent().get(&JobDataKey::Job(job_id)).unwrap();
        if job.employer != employer { panic!("Not employer"); }

        let mut milestone = job.milestones.get(milestone_idx).unwrap();
        if milestone.completed { panic!("Already completed"); }

        milestone.completed = true;
        job.milestones.set(milestone_idx, milestone.clone());

        // Release payment from escrow
        let freelancer = job.freelancer.as_ref().unwrap();
        let client = token::Client::new(env, &token_addr);
        client.transfer(&env.current_contract_address(), freelancer, &milestone.amount);

        let mut balance: i128 = env.storage().persistent().get(&JobDataKey::EscrowBalance(job_id)).unwrap();
        balance -= milestone.amount;
        env.storage().persistent().set(&JobDataKey::EscrowBalance(job_id), &balance);

        // Check if all milestones are done
        let mut all_done = true;
        for m in job.milestones.iter() {
            if !m.completed { all_done = false; break; }
        }
        if all_done {
            job.status = JobStatus::Completed;
        }

        env.storage().persistent().set(&JobDataKey::Job(job_id), &job);
    }
}
