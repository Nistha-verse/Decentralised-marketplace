
# 🛒 Decentralised Marketplace DApp (Soroban)

A decentralized marketplace built using **Soroban smart contracts on the Stellar network**, enabling users to list, buy, and sell items in a trustless and transparent way.

---

## 📌 Overview

This DApp allows users to:

* Connect a Stellar wallet
* List products on-chain
* Purchase items securely
* Execute trustless transactions via Soroban smart contracts

All marketplace logic is handled on-chain, ensuring transparency, immutability, and security.

---

## 🚀 Features

* 🔗 **Soroban Smart Contracts (Rust-based)**
* 💼 **Wallet Integration (Freighter, etc.)**
* 🛍️ **Product Listing System**
* 💰 **Secure Buy/Sell Transactions**
* 🔍 **On-chain Data Transparency**
* ⚡ **Fast & Low-cost Transactions (Stellar Network)**

---

## 🧱 Tech Stack

### Blockchain

* Soroban (Stellar Smart Contracts)
* Stellar Network

### Smart Contracts

* Rust

### Frontend

* React.js
* Soroban Client / Stellar SDK

---

## ⚙️ How It Works

1. User connects their wallet
2. Seller lists an item
3. Data is stored via Soroban contract
4. Buyer purchases item
5. Contract handles transaction logic securely

---

## 🛠️ Installation & Setup

### Prerequisites

* Rust & Cargo
* Soroban CLI
* Node.js & npm
* Stellar wallet

---

### Clone Repository

```bash
git clone https://github.com/Nistha-verse/decentralised_market_place.git
cd decentralised_market_place
```

---

### Install Dependencies

```bash
npm install
```

---

### Build Contract

```bash
cargo build --target wasm32-unknown-unknown --release
```

---

### Deploy Contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/marketplace.wasm \
  --source <your-account> \
  --network testnet
```

---

### Run Frontend

```bash
npm start
```

---

## 📦 Smart Contract Details

**Contract Address:**

```
CBIG7VTLEOQ6I3AM2AJPHGC57N4TXOXLHA3HRLESMT5IFEHHQQHRUSWZ
```

**Network:**


Testnet

---
## 🧪 Testing

Run contract tests:

cargo test

Ensure output shows:

running 3 tests
test ... ok
test ... ok
test ... ok


## 📸 Screenshots


<img width="1911" height="1028" alt="Screenshot 2026-03-21 192039" src="https://github.com/user-attachments/assets/15acb6b0-0047-459d-8528-5c5782112baf" />

<img width="1887" height="992" alt="Screenshot 2026-03-26 153244" src="https://github.com/user-attachments/assets/149efc41-9d97-495c-bf5a-063f795cb31d" />



<img width="1902" height="1029" alt="Screenshot 2026-03-20 153116" src="https://github.com/user-attachments/assets/d5d58fce-4853-4b3c-8bd5-59be45760cdd" />
<img width="876" height="168" alt="Screenshot 2026-03-27 195948" src="https://github.com/user-attachments/assets/8e144f6b-63ac-4c45-a4f3-8a57b28b4ed0" />




---
## 🌐 Live Demo
https://decentralised-marketplace-bp9whn6lr-nistha-verses-projects.vercel.app/
## 🎥 Demo Video
https://drive.google.com/file/d/1y4zxPOq4OoF0J1WXxlHHlypqkHooEDsn/view?usp=sharing



## 📁 Project Structure

```
/contracts        → Soroban smart contracts (Rust)
/src              → Frontend code
/scripts          → Deployment scripts
/screenshots      → App images
```

---

## 🔒 Security Considerations

* Audit smart contracts before production
* Never expose private keys
* Use testnet before mainnet deployment
* Validate all inputs

---


## 🌱 Future Improvements

* ⭐ Reputation system
* ⚖️ Escrow mechanism
* 📦 IPFS integration
* 🔗 Multi-token support

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch
3. Commit changes
4. Open a PR

---

## 📜 License

MIT License

---


