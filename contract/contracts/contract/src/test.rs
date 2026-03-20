#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

#[test]
fn test_create_listing() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Vintage Camera"),
        &String::from_str(&env, "Canon AE-1 in great condition"),
        &500_0000000i128,
        &token,
    );
    assert_eq!(listing_id, 0u64);

    let listing = client.get_listing(&listing_id);
    assert_eq!(listing.seller, seller);
    assert_eq!(listing.title, String::from_str(&env, "Vintage Camera"));
    assert_eq!(
        listing.description,
        String::from_str(&env, "Canon AE-1 in great condition")
    );
    assert_eq!(listing.price, 500_0000000i128);
    assert_eq!(listing.status, 0u32);
}

#[test]
fn test_purchase_and_ship_flow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Mechanical Keyboard"),
        &String::from_str(&env, "Cherry MX Blue switches"),
        &100_0000000i128,
        &token,
    );

    client.purchase(&buyer, &listing_id);
    let listing = client.get_listing(&listing_id);
    assert_eq!(listing.status, 1u32);
    assert_eq!(listing.buyer, Some(buyer.clone()));

    client.mark_shipped(&seller, &listing_id);
    let listing = client.get_listing(&listing_id);
    assert_eq!(listing.status, 2u32);

    client.confirm_received(&buyer, &listing_id);
    let listing = client.get_listing(&listing_id);
    assert_eq!(listing.status, 3u32);
}

#[test]
#[should_panic(expected = "listing not available")]
fn test_cannot_double_purchase() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Limited Sneakers"),
        &String::from_str(&env, "Size 10, never worn"),
        &200_0000000i128,
        &token,
    );

    client.purchase(&buyer1, &listing_id);
    client.purchase(&buyer2, &listing_id);
}

#[test]
#[should_panic(expected = "not the seller")]
fn test_only_seller_can_mark_shipped() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let stranger = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Art Print"),
        &String::from_str(&env, "Signed limited edition"),
        &150_0000000i128,
        &token,
    );

    client.purchase(&buyer, &listing_id);
    client.mark_shipped(&stranger, &listing_id);
}

#[test]
#[should_panic(expected = "not the buyer")]
fn test_only_buyer_can_confirm_received() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let stranger = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Vinyl Record"),
        &String::from_str(&env, "Pink Floyd - Dark Side"),
        &80_0000000i128,
        &token,
    );

    client.purchase(&buyer, &listing_id);
    client.mark_shipped(&seller, &listing_id);
    client.confirm_received(&stranger, &listing_id);
}

#[test]
fn test_get_all_listings() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let token = Address::generate(&env);

    client.create_listing(
        &seller,
        &String::from_str(&env, "Item 1"),
        &String::from_str(&env, "Description 1"),
        &100_0000000i128,
        &token,
    );
    client.create_listing(
        &seller,
        &String::from_str(&env, "Item 2"),
        &String::from_str(&env, "Description 2"),
        &200_0000000i128,
        &token,
    );

    let all = client.get_all_listings();
    assert_eq!(all.len(), 2);
}

#[test]
fn test_get_available_listings() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let token = Address::generate(&env);

    client.create_listing(
        &seller,
        &String::from_str(&env, "Item A"),
        &String::from_str(&env, "Desc A"),
        &100_0000000i128,
        &token,
    );
    client.create_listing(
        &seller,
        &String::from_str(&env, "Item B"),
        &String::from_str(&env, "Desc B"),
        &200_0000000i128,
        &token,
    );

    let listing_id = 0u64;
    client.purchase(&buyer, &listing_id);

    let available = client.get_available_listings();
    assert_eq!(available.len(), 1);
    assert_eq!(available.get(0).unwrap().id, 1u64);
}

#[test]
#[should_panic(expected = "listing not available")]
fn test_purchase_requires_not_shipped() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let buyer2 = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Widget"),
        &String::from_str(&env, "A fine widget"),
        &50_0000000i128,
        &token,
    );

    client.purchase(&buyer, &listing_id);
    client.mark_shipped(&seller, &listing_id);
    client.confirm_received(&buyer, &listing_id);
    client.purchase(&buyer2, &listing_id);
}

#[test]
#[should_panic(expected = "must be purchased first")]
fn test_ship_before_purchase_panics() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Gadget"),
        &String::from_str(&env, "Cool thing"),
        &75_0000000i128,
        &token,
    );

    client.mark_shipped(&seller, &listing_id);
}

#[test]
#[should_panic(expected = "must be shipped first")]
fn test_confirm_before_ship_panics() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let token = Address::generate(&env);

    let listing_id = client.create_listing(
        &seller,
        &String::from_str(&env, "Thing"),
        &String::from_str(&env, "Nice"),
        &60_0000000i128,
        &token,
    );

    client.purchase(&buyer, &listing_id);
    client.confirm_received(&buyer, &listing_id);
}
