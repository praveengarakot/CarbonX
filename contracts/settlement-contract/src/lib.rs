#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    pub fn settle_payment(env: Env, buyer: Address, seller: Address, amount: u128) {
        buyer.require_auth();

        env.events().publish(
            (symbol_short!("pay_lock"), buyer.clone()),
            amount,
        );

        env.events().publish(
            (symbol_short!("pay_rel"), seller.clone()),
            amount,
        );
    }
}
