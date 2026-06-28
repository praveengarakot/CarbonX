#![cfg(test)]

use super::*;
use soroban_sdk::{Env, Address, Symbol};
use soroban_sdk::testutils::Address as _;
use carbon_registry::{CarbonRegistry, CarbonRegistryClient};
use marketplace_contract::{MarketplaceContract, MarketplaceContractClient};
use settlement_contract::SettlementContract;
use retirement_contract::{RetirementContract, RetirementContractClient};


#[test]
fn test_full_carbon_marketplace_flow() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Generate addresses
    let admin = Address::generate(&env);
    let verifier = Address::generate(&env);
    let developer = Address::generate(&env);
    let buyer = Address::generate(&env);

    // 2. Register and initialize Verification Contract
    let verification_id = env.register_contract(None, VerificationContract);
    let verification_client = VerificationContractClient::new(&env, &verification_id);
    verification_client.init(&admin);
    verification_client.add_verifier(&verifier);

    // 3. Register and initialize Carbon Registry
    let registry_id = env.register_contract(None, CarbonRegistry);
    let registry_client = CarbonRegistryClient::new(&env, &registry_id);
    registry_client.init(&verification_id);

    // 4. Register Marketplace Contract
    let marketplace_id = env.register_contract(None, MarketplaceContract);
    let marketplace_client = MarketplaceContractClient::new(&env, &marketplace_id);

    // 5. Register Settlement Contract
    let settlement_id = env.register_contract(None, SettlementContract);

    // 6. Register Retirement Contract
    let retirement_id = env.register_contract(None, RetirementContract);
    let retirement_client = RetirementContractClient::new(&env, &retirement_id);

    // Assert initial state
    assert!(verification_client.is_verifier(&verifier));
    assert!(!verification_client.is_verifier(&developer));

    // --- SUBMISSION & MINTING ---
    let desc = Symbol::new(&env, "Solar_Plant_Kolkata");
    let project_id = verification_client.submit_project(&developer, &desc, &120);
    assert_eq!(project_id, 1);

    // Verify project, which invokes registry to mint 120 credits to developer
    verification_client.verify_project(&verifier, &project_id, &registry_id);

    // Assert credits are minted to developer
    assert_eq!(registry_client.get_balance(&developer), 120);
    assert_eq!(registry_client.get_owner(&1), developer.clone());

    // --- MARKETPLACE LISTING ---
    // Developer lists the minted credit ID 1 for 50 XLM
    let listing_id = marketplace_client.list_credit(&developer, &registry_id, &1, &50);
    assert_eq!(listing_id, 1);


    // --- PURCHASE & SETTLEMENT ---
    // Buyer purchases the listing
    marketplace_client.buy_credit(&buyer, &listing_id, &registry_id, &settlement_id);

    // Assert ownership has transferred to the buyer
    assert_eq!(registry_client.get_balance(&developer), 0);
    assert_eq!(registry_client.get_balance(&buyer), 120);
    assert_eq!(registry_client.get_owner(&1), buyer.clone());

    // --- RETIREMENT & CARBON SCORE ---
    // Buyer retires the carbon credits
    let cert_id = retirement_client.retire_credit(&buyer, &registry_id, &1);
    assert_eq!(cert_id, 1);

    // Assert credits are retired
    assert_eq!(registry_client.get_balance(&buyer), 0);
    assert_eq!(registry_client.get_retired_balance(&buyer), 120);

    // Assert Carbon Impact Score has increased (base score 50 + 120*10 = 1250, capped at 100)
    let final_score = retirement_client.get_score(&buyer);
    assert_eq!(final_score, 100);
}
