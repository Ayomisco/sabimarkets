# SabiMarkets System Architecture & Web3 Integration

## Overview
SabiMarkets is a localized, high-performance interface built on top of the Polymarket infrastructure. It is designed specifically to capture the African market by bringing localized news, politics, sports, and economic forecasting into a highly responsive, "Dark Mode Native" financial terminal.

As a Polymarket Builder partner, SabiMarkets leverages the decentralized liquidity and resolution mechanisms of Polymarket while providing a frictionless, tailored UX for African users.

---

## Technical Stack
- **Frontend Framework:** Next.js 16 (App Router) + React 18
- **Styling:** Tailwind CSS + Radix UI + Framer Motion (for micro-animations)
- **Data Visualization:** Recharts (rendering live CLOB tick data)
- **State Management:** Zustand (for ephemeral UI state and local portfolio caching)
- **Web3 Interaction:** `wagmi` / `viem` (for wallet connection and EIP-712 signature requests)
- **Data APIs:** Polymarket Gamma API (REST) & Polymarket CLOB (WebSockets & REST)

---

## 🏗️ Architecture & Component Flow

### 1. Market Indexing & Filtering (Gamma API)
SabiMarkets dynamically indexes active markets from the Polymarket Gamma API. To fulfill its core value proposition, the indexing engine applies a strict localized filter:
- Prioritizes markets containing keywords for all 54 African countries, leaders, major cities, and local currencies.
- Aggressively filters out non-global, hyper-specific U.S. markets (e.g., local state politics, IRS revenue metrics) to maintain a curated, globally relevant feed.

### 2. Deep Liquidity & Real-Time Sync (CLOB)
- SabiMarkets connects to the **Polymarket Central Limit Order Book (CLOB)** via WebSockets.
- Real-time tick updates drive changes perfectly synchronized with Polymarket across the App’s Marquee ticker, Market Cards, and interactive Recharts graphs.

### 3. Execution Layer (Web3 & Smart Contracts)
SabiMarkets does not operate its own order matching engine or take custody of user funds. It operates completely trustlessly as a decentralized client.
- **Where the Money Goes:** When a user buys "YES" or "NO" shares, their connected Web3 Wallet (via `wagmi`) signs an EIP-712 transaction. The funds (USDC on Polygon) are routed directly into Polymarket’s decentralized smart contracts. The smart contract mints the corresponding Outcome Tokens directly into the user’s wallet.
- **Where it's Recorded:** Every single interaction, bet, and resolution is permanently recorded on the Polygon blockchain ledger. SabiMarkets tracks user positions purely by observing on-chain balances and Gamma API `/positions` endpoints associated with the user's wallet address.

---

## 💰 Monetization Strategy
Operating a non-custodial decentralized frontend presents unique and lucrative monetization channels. Since the money doesn't directly enter a SabiMarkets bank account, revenue is generated at the protocol and interface layers:

1. **Relayer Fees / Frontend Fee Injection:**
   Polymarket's CLOB API allows interface operators (relayers) to append a small percentage fee (e.g., 0.5% - 1%) to trades routed through their specific UI. When users place a large order, a small fraction of the USDC spent goes to the SabiMarkets treasury wallet.
   
2. **Polymarket Builder Program & Grants:**
   Being an official UI partner operating in the high-growth African demographic qualifies SabiMarkets for Polymarket's ecosystem grants, liquidity provision rewards, and volume-based builder incentives.

3. **Premium / PRO Tiers:**
   Offering deep analytical tools, whale-watching wallets, instant alerts for new African markets, or "smart money" tracking as a paid monthly SaaS subscription (SabiMarkets Pro).

4. **Fiat On/Off-Ramp Affiliates:**
   African users need to convert Local Fiat (Naira, Cedis) into Polygon USDC to trade. By integrating partners heavily (like Busha, YellowCard, or MoonPay), SabiMarkets earns commission revenue on every fiat deposit and withdrawal routed through the platform.

---

## Security & Custody
- **Self-Custody:** SabiMarkets never holds private keys. User funds are secured by their own wallet provider (MetaMask, Coinbase Wallet, Trust Wallet).
- **No Withdrawal Friction:** Users can withdraw their USDC directly from Polymarket's smart contracts to their wallets at any time.

## Roadmap Forward
- Integrate embedded / abstracted wallets (e.g., Privy or Magic.link) so users can sign up with an Email/Phone number and never realize they are using a Web3 wallet.
- Direct Fiat on-ramps straight to the "Buy" button using local mobile money APIs.
