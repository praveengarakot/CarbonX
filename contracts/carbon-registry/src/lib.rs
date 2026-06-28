#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, IntoVal};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Credit {
    pub id: u64,
    pub original_owner: Address,
    pub amount: u128,
    pub project_id: u64,
    pub retired: bool,
}

#[contract]
pub struct CarbonRegistry;

#[contractimpl]
impl CarbonRegistry {
    pub fn init(env: Env, verification_contract: Address) {
        if env.storage().instance().has(&symbol_short!("verifier")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&symbol_short!("verifier"), &verification_contract);
    }
    
    pub fn mint(env: Env, recipient: Address, amount: u128, project_id: u64) -> u64 {
        let verifier: Address = env.storage().instance().get(&symbol_short!("verifier")).expect("not initialized");
        verifier.require_auth();

        let mut credit_count: u64 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        credit_count += 1;
        env.storage().instance().set(&symbol_short!("count"), &credit_count);

        let credit = Credit {
            id: credit_count,
            original_owner: recipient.clone(),
            amount,
            project_id,
            retired: false,
        };

        env.storage().instance().set(&credit_count, &credit);

        let key_balance = (symbol_short!("balance"), recipient.clone());
        let mut balance: u128 = env.storage().instance().get(&key_balance).unwrap_or(0);
        balance += amount;
        env.storage().instance().set(&key_balance, &balance);

        let key_owner = (symbol_short!("owner"), credit_count);
        env.storage().instance().set(&key_owner, &recipient);

        env.events().publish(
            (symbol_short!("minted"), credit_count),
            (recipient, amount),
        );

        credit_count
    }

    pub fn get_owner(env: Env, credit_id: u64) -> Address {
        let key_owner = (symbol_short!("owner"), credit_id);
        env.storage().instance().get(&key_owner).expect("credit does not exist")
    }

    pub fn get_credit(env: Env, credit_id: u64) -> Credit {
        env.storage().instance().get(&credit_id).expect("credit does not exist")
    }

    pub fn get_balance(env: Env, address: Address) -> u128 {
        let key_balance = (symbol_short!("balance"), address);
        env.storage().instance().get(&key_balance).unwrap_or(0)
    }

    pub fn get_retired_balance(env: Env, address: Address) -> u128 {
        let key_retired = (symbol_short!("retired"), address);
        env.storage().instance().get(&key_retired).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, credit_id: u64) {
        from.require_auth();
        let key_owner = (symbol_short!("owner"), credit_id);
        let current_owner: Address = env.storage().instance().get(&key_owner).expect("credit does not exist");
        if current_owner != from {
            panic!("not the owner of the credit");
        }

        let mut credit: Credit = env.storage().instance().get(&credit_id).unwrap();
        if credit.retired {
            panic!("cannot transfer retired credit");
        }

        env.storage().instance().set(&key_owner, &to);

        let key_balance_from = (symbol_short!("balance"), from.clone());
        let mut balance_from: u128 = env.storage().instance().get(&key_balance_from).unwrap_or(0);
        if balance_from < credit.amount {
            panic!("insufficient balance");
        }
        balance_from -= credit.amount;
        env.storage().instance().set(&key_balance_from, &balance_from);

        let key_balance_to = (symbol_short!("balance"), to.clone());
        let mut balance_to: u128 = env.storage().instance().get(&key_balance_to).unwrap_or(0);
        balance_to += credit.amount;
        env.storage().instance().set(&key_balance_to, &balance_to);

        env.events().publish(
            (symbol_short!("transfer"), credit_id),
            (from, to),
        );
    }

    pub fn retire(env: Env, owner: Address, credit_id: u64) {
        owner.require_auth();
        let key_owner = (symbol_short!("owner"), credit_id);
        let current_owner: Address = env.storage().instance().get(&key_owner).expect("credit does not exist");
        if current_owner != owner {
            panic!("not the owner of the credit");
        }

        let mut credit: Credit = env.storage().instance().get(&credit_id).unwrap();
        if credit.retired {
            panic!("credit already retired");
        }

        credit.retired = true;
        env.storage().instance().set(&credit_id, &credit);

        let key_balance = (symbol_short!("balance"), owner.clone());
        let mut balance: u128 = env.storage().instance().get(&key_balance).unwrap_or(0);
        if balance < credit.amount {
            panic!("insufficient balance");
        }
        balance -= credit.amount;
        env.storage().instance().set(&key_balance, &balance);

        let key_retired = (symbol_short!("retired"), owner.clone());
        let mut retired_balance: u128 = env.storage().instance().get(&key_retired).unwrap_or(0);
        retired_balance += credit.amount;
        env.storage().instance().set(&key_retired, &retired_balance);

        env.events().publish(
            (symbol_short!("retired"), credit_id),
            owner,
        );
    }
}
