#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, IntoVal, Val};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    pub id: u64,
    pub developer: Address,
    pub description: Symbol,
    pub amount: u128,
    pub verified: bool,
    pub verifier: Option<Address>,
}

#[contract]
pub struct VerificationContract;

#[contractimpl]
impl VerificationContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }
    
    pub fn add_verifier(env: Env, verifier: Address) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();
        env.storage().instance().set(&verifier, &true);
    }
    
    pub fn is_verifier(env: Env, address: Address) -> bool {
        env.storage().instance().get(&address).unwrap_or(false)
    }

    pub fn submit_project(env: Env, developer: Address, description: Symbol, amount: u128) -> u64 {
        developer.require_auth();
        let mut count: u64 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&symbol_short!("count"), &count);

        let project = Project {
            id: count,
            developer,
            description,
            amount,
            verified: false,
            verifier: None,
        };
        
        env.storage().instance().set(&count, &project);
        count
    }

    pub fn verify_project(env: Env, verifier: Address, project_id: u64, registry_contract: Address) {
        verifier.require_auth();
        if !Self::is_verifier(env.clone(), verifier.clone()) {
            panic!("not an authorized verifier");
        }

        let mut project: Project = env.storage().instance().get(&project_id).expect("project not found");
        if project.verified {
            panic!("project already verified");
        }

        project.verified = true;
        project.verifier = Some(verifier.clone());
        env.storage().instance().set(&project_id, &project);

        env.events().publish(
            (symbol_short!("verified"), project_id),
            (project.developer.clone(), project.amount),
        );

        let client = RegistryClient::new(&env, &registry_contract);
        client.mint(&project.developer, &project.amount, &project_id);
    }

    pub fn get_project(env: Env, project_id: u64) -> Project {
        env.storage().instance().get(&project_id).expect("project not found")
    }
}

struct RegistryClient<'a> {
    env: &'a Env,
    address: &'a Address,
}

impl<'a> RegistryClient<'a> {
    fn new(env: &'a Env, address: &'a Address) -> Self {
        Self { env, address }
    }
    
    fn mint(&self, recipient: &Address, amount: &u128, project_id: &u64) {
        let _: u64 = self.env.invoke_contract(
            self.address,
            &Symbol::new(self.env, "mint"),
            soroban_sdk::vec![self.env, recipient.clone().into_val(self.env), amount.clone().into_val(self.env), project_id.clone().into_val(self.env)],
        );
    }

}

#[cfg(test)]
mod test;

