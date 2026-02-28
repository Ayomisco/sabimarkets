# SabiMarket — Production Architecture & Roadmap

> Full technical blueprint for taking SabiMarket from a UI demo to a live, revenue-generating prediction market on Polygon.

---

## 1. What's Live Right Now (Current State)

| Layer | Status | Notes |
|---|---|---|
| Frontend (Next.js) | ✅ Deployed | sabimarket.xyz on Vercel |
| 16 African Languages | ✅ Live | Auto-translated via Google Translate |
| Market Feed | ✅ Live | Reads Polymarket Gamma API (read-only) |
| Wallet Connect (Mobile) | ✅ Live | WalletConnect project ID wired |
| Portfolio | ⚠️ Simulated | Stored in browser localStorage only |
| Real Trading | ❌ Not wired | Needs proxy wallet + CLOB integration |
| Smart Contracts | ❌ None deployed | Polymarket's contracts used directly |
| Revenue / Fees | ❌ Not collected | Builder fee wallet set, needs CLOB wiring |

---

## 2. What Smart Contracts Do We Actually Need?

**Good news:** Polymarket has already deployed all the core contracts on Polygon. You do NOT need to write a trading exchange.

### 2A. Contracts SabiMarket Must Deploy

| Contract | Purpose | Complexity |
|---|---|---|
| **SabiProxy Factory** | Deploys a personal proxy wallet for each user on first trade | Medium |
| **Fee Distributor** (optional) | Splits builder fees between team & referrers | Low |

### 2B. Polymarket Contracts Already On Polygon (Use Directly)

| Contract | Address (Polygon) | Purpose |
|---|---|---|
| CTF Exchange | `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` | Buy/sell order routing |
| USDC (native) | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | Collateral token |
| Conditional Tokens | `0x4D97DCd97eC945f40cF65F87097ACe5EA0476045` | Outcome token holdings |
| Neg Risk Adapter | `0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296` | Multi-outcome markets |

---

## 3. Full System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    USER (Browser / Mobile)                     │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼──────────────────────────────────┐
│              FRONTEND  ·  sabimarket.xyz                       │
│  Next.js 16 App Router  ·  Vercel Edge Network                 │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Market Feed │  │  Bet Modal   │  │  Portfolio Tracker  │  │
│  │ (read-only) │  │  (CLOB sign) │  │  (Gamma API query)  │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
└───────┬────────────────┬───────────────────────┬──────────────┘
        │                │                       │
        ▼                ▼                       ▼
┌───────────────┐ ┌──────────────────┐ ┌────────────────────┐
│  Polymarket   │ │  SabiMarket API  │ │  Polygon Mainnet   │
│  Gamma API    │ │  (Next.js API    │ │  (via Alchemy RPC) │
│  (read only)  │ │   Routes)        │ │                    │
│               │ │                  │ │  ┌──────────────┐  │
│  /markets     │ │  /api/order      │ │  │ CTF Exchange │  │
│  /positions   │ │  /api/proxy      │ │  │ (Polymarket) │  │
│  /trades      │ │  /api/portfolio  │ │  └──────────────┘  │
└───────────────┘ └────────┬─────────┘ └────────────────────┘
                           │
                    ┌──────▼──────────────────┐
                    │  Polymarket CLOB API     │
                    │  clob.polymarket.com     │
                    │                         │
                    │  POST /order            │
                    │  GET  /order-book       │
                    │  GET  /trades           │
                    └─────────────────────────┘
```

---

## 4. Environment Variables (All Keys)

```bash
# WalletConnect Cloud (Mobile wallet deep-links)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="d579a8a79998b9febf26831effd00175"

# Polymarket Builder Program
NEXT_PUBLIC_POLY_BUILDER_KEY="019a500c-f1a7-737d-88ad-788a12422964"
POLY_BUILDER_API_KEY="019a500c-f1a7-737d-88ad-788a12422964"

# Your Polygon Wallet (receives builder fee rebates automatically)
BUILDER_WALLET_ADDRESS="0x8f0E9b15028311F263be1B71c1D5d8Ae8a35294e"
NEXT_PUBLIC_BUILDER_WALLET_ADDRESS="0x8f0E9b15028311F263be1B71c1D5d8Ae8a35294e"

# Polygon RPC (Alchemy)
POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/0eaW84ZOso5Dgsx8phHun"
NEXT_PUBLIC_POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/0eaW84ZOso5Dgsx8phHun"

# Site
NEXT_PUBLIC_SITE_URL="https://sabimarket.xyz"
```

> **On `BUILDER_WALLET_ADDRESS`:** `0x8f0E9b15028311F263be1B71c1D5d8Ae8a35294e` is your Polygon EOA.
> Polymarket sends builder fee rebates here automatically whenever an order is tagged with your builder key. No contract needed for this.

---

## 5. Real Trading Flow (Step by Step)

### Step 1 — User Connects Wallet
RainbowKit + WalletConnect. Works on MetaMask, Coinbase Wallet, Trust Wallet, WalletConnect deep-link on mobile.

### Step 2 — First Trade: Deploy Proxy Wallet
```
User clicks "Buy YES"
  → Backend: GET /clob/auth/type
  → If no proxy → POST /clob/auth/create-api-key
  → User signs EIP-712 message to authorize proxy
  → Proxy wallet address stored per user
```

### Step 3 — USDC Allowance (One-Time)
```
  → SabiMarket calls USDC contract:
      approve(CTF_EXCHANGE_ADDRESS, MaxUint256)
  → User signs transaction
  → Never needed again for same wallet
```

### Step 4 — Place Order via CLOB
```
User enters amount → clicks Buy
  → Backend builds order payload:
    {
      tokenId: "<outcome_token_id>",
      price: 0.62,
      side: "BUY",
      size: 100,             ← USDC amount
      maker: userAddress,
      builder: "0x8f0E..."   ← your wallet = you earn fees
    }
  → User signs EIP-712 typed data in wallet
  → POST signed order to Polymarket CLOB API
  → Order matched → outcome tokens credited to proxy wallet
```

### Step 5 — Portfolio (Production)
```
Drop localStorage simulation entirely.
  → GET gamma-api.polymarket.com/positions?user=0x{address}
  → Returns real token holdings
  → Show real P&L from blockchain truth
```

---

## 6. API Routes To Build

```
src/app/api/
├── clob/
│   ├── auth/route.ts         ← creates proxy wallet per user
│   ├── order/route.ts        ← signs + submits to CLOB
│   └── positions/route.ts    ← fetches real user positions
├── markets/
│   └── route.ts              ← cached African market feed
└── portfolio/
    └── route.ts              ← aggregated P&L
```

**Install Polymarket SDK:**
```bash
npm install @polymarket/clob-client @polymarket/order-utils
```

---

## 7. SabiProxy Factory Contract (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProxyFactory {
    function deployProxy(address owner) external returns (address proxy);
}

contract SabiProxyFactory {
    IProxyFactory constant POLY_FACTORY =
        IProxyFactory(0xaB45c5A4B0c941a2F231C6f3C41a8e3E8F5D8e9C);

    mapping(address => address) public userProxy;

    event ProxyCreated(address indexed user, address proxy);

    function getOrCreateProxy() external returns (address proxy) {
        if (userProxy[msg.sender] != address(0))
            return userProxy[msg.sender];
        proxy = POLY_FACTORY.deployProxy(msg.sender);
        userProxy[msg.sender] = proxy;
        emit ProxyCreated(msg.sender, proxy);
    }
}
```

---

## 8. Testing Strategy

```bash
# 1. Local unit tests (Hardhat)
npx hardhat test

# 2. Amoy Testnet (staging)
#    Get test MATIC: https://faucet.polygon.technology/
npx hardhat run scripts/deploy.ts --network amoy

# 3. Polygon Mainnet
npx hardhat run scripts/deploy.ts --network polygon
```

---

## 9. Go-Live Checklist

### Immediate (This Week)
- [ ] Add all env vars to **Vercel Dashboard → Settings → Environment Variables**
- [ ] Add `sabimarket.xyz` in **Vercel → Domains**, set DNS A record → `76.76.21.21`
- [ ] Test mobile wallet connect end-to-end (MetaMask mobile + WalletConnect)
- [ ] Verify Builder Program key at polymarket.com/builders

### Real Trading (Weeks 2–3)
- [ ] Install `@polymarket/clob-client`
- [ ] Build `/api/clob/auth` — proxy wallet creation
- [ ] Build `/api/clob/order` — signed order submission
- [ ] Test full trade on Polygon **Amoy testnet**
- [ ] Deploy `SabiProxyFactory` to Polygon Mainnet
- [ ] Replace localStorage portfolio with Gamma API `/positions`

### Business
- [ ] Confirm `0x8f0E9b...` receives fee rebates after first trade
- [ ] Set up error monitoring (Sentry)
- [ ] Set up Vercel Analytics

---

## 10. Revenue Model

| Source | How | Timeline |
|---|---|---|
| **Builder Fees** | Polymarket pays ~0.5–1% of trade volume to your wallet automatically | Day 1 of real orders |
| **Spread** | Small markup on quoted prices | Phase 3 |
| **Referral Fee Split** | Revenue share with users who refer others | Phase 4 |

---

## 11. 8-Week Timeline

| Week | Goal |
|---|---|
| **1 (Now)** | Domain live, mobile wallet works, language picker fixed |
| **2** | CLOB API routes built, test order signing on Amoy testnet |
| **3** | SabiProxy contract deployed to Amoy + end-to-end trade test |
| **4** | **Mainnet launch** — real trades, builder fees flowing |
| **6** | Real portfolio from chain, remove localStorage simulation |
| **8** | Search filters live, notifications, referral system |
