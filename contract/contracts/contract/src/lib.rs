#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub id: u64,
    pub seller: Address,
    pub title: String,
    pub description: String,
    pub price: i128,
    pub token: Address,
    pub buyer: Option<Address>,
    pub status: u32, // 0=Available, 1=Purchased, 2=Shipped, 3=Received
}

#[contracttype]
pub enum DataKey {
    Listings,
    NextId,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Create a new listing. Anyone can list — fully permissionless.
    pub fn create_listing(
        env: Env,
        seller: Address,
        title: String,
        description: String,
        price: i128,
        token: Address,
    ) -> u64 {
        seller.require_auth();
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        let listing = Listing {
            id: next_id,
            seller,
            title,
            description,
            price,
            token,
            buyer: None,
            status: 0,
        };
        let mut listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        listings.set(next_id, listing);
        env.storage().instance().set(&DataKey::Listings, &listings);
        env.storage()
            .instance()
            .set(&DataKey::NextId, &(next_id + 1));
        next_id
    }

    /// Mark a listing as purchased. Payment is handled off-chain (buyer sends tokens directly).
    pub fn purchase(env: Env, buyer: Address, listing_id: u64) {
        buyer.require_auth();
        let mut listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        let mut listing = listings.get(listing_id).expect("listing not found");
        assert!(listing.status == 0, "listing not available");
        listing.status = 1;
        listing.buyer = Some(buyer);
        listings.set(listing_id, listing);
        env.storage().instance().set(&DataKey::Listings, &listings);
    }

    /// Seller marks the item as shipped.
    pub fn mark_shipped(env: Env, seller: Address, listing_id: u64) {
        seller.require_auth();
        let mut listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        let listing = listings.get(listing_id).expect("listing not found");
        assert_eq!(listing.seller, seller, "not the seller");
        assert!(listing.status == 1, "must be purchased first");
        let mut listing = listing;
        listing.status = 2;
        listings.set(listing_id, listing);
        env.storage().instance().set(&DataKey::Listings, &listings);
    }

    /// Buyer confirms receipt. Transaction complete.
    pub fn confirm_received(env: Env, buyer: Address, listing_id: u64) {
        buyer.require_auth();
        let mut listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        let listing = listings.get(listing_id).expect("listing not found");
        assert_eq!(listing.buyer, Some(buyer), "not the buyer");
        assert!(listing.status == 2, "must be shipped first");
        let mut listing = listing;
        listing.status = 3;
        listings.set(listing_id, listing);
        env.storage().instance().set(&DataKey::Listings, &listings);
    }

    /// Get a single listing by ID.
    pub fn get_listing(env: Env, listing_id: u64) -> Listing {
        let listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        listings.get(listing_id).expect("listing not found")
    }

    /// Get all listings.
    pub fn get_all_listings(env: Env) -> Vec<Listing> {
        let listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        listings.values()
    }

    /// Get only available (unpurchased) listings.
    pub fn get_available_listings(env: Env) -> Vec<Listing> {
        let listings: Map<u64, Listing> = env
            .storage()
            .instance()
            .get(&DataKey::Listings)
            .unwrap_or(Map::new(&env));
        let mut available: Vec<Listing> = Vec::new(&env);
        for (_, listing) in listings.iter() {
            if listing.status == 0 {
                available.push_back(listing);
            }
        }
        available
    }
}

mod test;
