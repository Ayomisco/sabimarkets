# SabiMarkets — Africa's Native Prediction Market on Flow EVM

> Decentralized prediction markets natively built for Africa, deployed on Flow blockchain.

---

## 🚀 Live Deployment

| Resource | Link |
|---|---|
| **Live App (Testnet)** | https://testnet.sabimarket.xyz |
| **Factory Contract** | [`0xE7579839f736Be431750DCC8715de34305C71c4E`](https://evm-testnet.flowscan.io/address/0xE7579839f736Be431750DCC8715de34305C71c4E) |
| **USDC (Test)** | [`0x1b568EaBb15edb5CAd05ac3Ba983e238DE1854B3`](https://evm-testnet.flowscan.io/address/0x1b568EaBb15edb5CAd05ac3Ba983e238DE1854B3) |
| **Network** | Flow EVM Testnet (Chain ID: 545) |
| **Markets Deployed** | 33 live prediction markets |
| **Block Explorer** | https://evm-testnet.flowscan.io |

### Deployed Prediction Markets (Sample)

| # | Market | Category |
|---|---|---|
| 1 | Will Nigeria hold presidential elections in 2027? | Politics |
| 2 | Will South Africa's GDP grow above 2% in 2025? | Economy |
| 3 | Will the African Continental Free Trade Area hit $1T in trade? | Economy |
| 4 | Will Bitcoin reach $150,000 by December 2025? | Crypto |
| 5 | Will Kenya's tech ecosystem surpass South Africa by 2026? | Technology |
| 6 | Will the AFCON 2025 final be watched by 500M+ people? | Sports |
| 7 | Will Ethiopia's economy grow by 10%+ in 2025? | Economy |
| 8 | Will West Africa launch a unified currency by 2027? | Politics |
| + 25 more | Africa politics, sports, economy, crypto markets | Various |

> All markets are live on-chain. Use the faucet at the USDC contract to get test tokens before trading.

---

## What is SabiMarkets?

**SabiMarkets** is a fully on-chain decentralized prediction market built natively for Africa, deployed on the **Flow EVM blockchain**. Users connect their wallets, browse real African and global prediction markets, and trade YES/NO binary outcome shares using USDC — all on-chain, with no intermediaries.

Unlike traditional prediction markets that geo-block African users or lack culturally relevant markets, SabiMarkets is:

- **Africa-first** — Markets curated around African politics, economics, sports, and culture
- **Multilingual** — Supports 15 African languages out of the box
- **Truly on-chain** — Every trade is a direct smart contract call using wagmi `writeContract`
- **Own contracts** — Full custom smart contract stack: `SabiMarketFactory` + `SabiMarket` + `MockUSDC`
- **Low cost** — Runs on Flow EVM, a high-performance EVM-compatible chain with near-zero fees

---

## 🏆 Hackathon Submission — PL_Genesis: Frontiers of Collaboration

**Tracks:**
- **Consumer DeFi Track** — On-chain prediction markets with direct contract interaction
- **Existing Code Track** — Significant refactor and extension of existing prediction market codebase
- **Crypto Track** — Flow EVM infrastructure + Solidity smart contracts

**Key Technical Achievements:**
- Complete removal of all Polymarket/Polygon dependencies
- Custom Solidity smart contracts (AMM-style binary outcome markets)
- 33 markets deployed on Flow EVM Testnet with live liquidity
- wagmi v2 + viem for on-chain reads and writes
- Server-side market data fetching via viem `createPublicClient`
- On-chain portfolio positions reader (no off-chain indexer needed)

---

## ✨ Features

- **33 Live Markets** — Real on-chain African and global prediction markets
- **15 Languages** — English, French, Arabic, Hausa, Yoruba, Igbo, Swahili, Amharic, Pidgin, Kinyarwanda, Somali, Portuguese, Twi, Xhosa, Zulu
- **On-Chain Trading** — Direct `buyShares()` / `sellShares()` via smart contracts
- **USDC Collateral** — ERC-20 based collateral with on-chain allowance management
- **Real-Time Charts** — Price probability charts with animated transitions
- **Portfolio Tracker** — On-chain position reader (YES/NO shares per market)
- **Admin Dashboard** — Market moderation and user management
- **Comment System** — Threaded market discussions with PostgreSQL persistence
- **Analytics** — User activity tracking and market view analytics
- **Mobile Responsive** — Optimized for all screen sizes
- **Faucet** — Test USDC freely mintable for testnet use

---

## 🏗️ Architecture

### Smart Contracts (`/smartcontracts`)

```
contracts/
├── MockUSDC.sol          # ERC-20 test token (6 decimals, faucet())
├── SabiMarket.sol        # Individual prediction market (AMM binary outcomes)
└── SabiMarketFactory.sol # Market registry + factory
```

**SabiMarket.sol** — Each deployed market contract handles:
- `buyShares(bool isYes, uint256 usdcAmount)` — Purchase YES or NO shares
- `sellShares(bool isYes, uint256 shares)` — Sell shares back to AMM pool
- `resolve(bool yesWon)` — Owner resolves market outcome
- `claimWinnings()` — Winners claim proportional USDC collateral
- `getYesPrice()` / `getNoPrice()` — On-chain AMM price oracle (scaled to 1e6)
- `getMarketInfo()` — Full market state in one call
- `getUserPosition(address)` — User's YES/NO share balances

**SabiMarketFactory.sol** — Registry with:
- `createMarket(question, category, imageUri, endTime)` — Deploy new market
- `getMarkets(offset, limit)` — Paginated market listing
- `getMarketsByCategory(category)` — Category-filtered markets
- `getMarketCount()` — Total markets deployed

### Frontend (`/src`)

```
src/
├── lib/
│   ├── contracts.ts           # Flow EVM chain def, ABIs, contract addresses
│   └── polymarket/
│       ├── api.ts             # On-chain market fetcher (viem readContract)
│       └── types.ts           # Market interface aligned with on-chain data
├── components/
│   ├── BetModal.tsx           # On-chain trade execution (approve + buyShares)
│   ├── MarketDetailModal.tsx  # Full market view with on-chain prices
│   ├── MarketCard.tsx         # Market card from on-chain data
│   ├── MarketList.tsx         # Filterable market grid
│   ├── MarketChart.tsx        # Price probability chart
│   ├── FeedAndPortfolio.tsx   # Main feed + on-chain portfolio tab
│   ├── Marquee.tsx            # Live price ticker
│   ├── WalletMenu.tsx         # RainbowKit wallet dropdown (Flow EVM)
│   └── Providers.tsx          # wagmi + RainbowKit providers (Flow EVM)
├── app/
│   ├── [locale]/page.tsx      # Server-side market fetch + i18n
│   └── api/
│       └── clob/
│           └── positions/     # On-chain portfolio position reader
└── store/
    ├── marketStore.ts         # Zustand market state
    └── portfolioStore.ts      # Zustand portfolio state
```

### Database (`/prisma`)

PostgreSQL via Neon — stores:
- User analytics (views, orders, activity)
- Comments and likes
- Admin moderation actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **Blockchain** | Flow EVM Testnet (Chain ID 545) |
| **Smart Contracts** | Solidity 0.8.24, OpenZeppelin, Hardhat 2 |
| **Web3 Client** | wagmi v2, viem, RainbowKit v2 |
| **State** | Zustand v5 |
| **i18n** | next-intl (15 languages) |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Charts** | Recharts |
| **Deployment** | Vercel (frontend), Flow EVM Testnet (contracts) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon free tier)
- WalletConnect Project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))

### 1. Clone & Install

```bash
git clone https://github.com/Ayomisco/sabimarkets.git
cd sabimarkets
npm install
```

### 2. Environment Variables

Create `.env.local` in the root:

```env
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Flow EVM Smart Contracts (Testnet)
NEXT_PUBLIC_FACTORY_ADDRESS=0xE7579839f736Be431750DCC8715de34305C71c4E
NEXT_PUBLIC_USDC_ADDRESS=0x1b568EaBb15edb5CAd05ac3Ba983e238DE1854B3

# Database
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. Database Setup

```bash
npx prisma db push
npx prisma generate
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Production Build

```bash
npm run build
npm start
```

---

## 🔗 Smart Contract Deployment

Contracts are deployed and verified on Flow EVM Testnet:

```
MockUSDC:          0x1b568EaBb15edb5CAd05ac3Ba983e238DE1854B3
SabiMarketFactory: 0xE7579839f736Be431750DCC8715de34305C71c4E
```

To re-deploy or deploy new markets:

```bash
cd smartcontracts
npm install
cp .env.example .env  # add DEPLOYER_PRIVATE_KEY and FLOW_TESTNET_RPC

# Deploy contracts
npx hardhat run scripts/deploy.js --network flowTestnet

# Seed additional markets
npx hardhat run scripts/seedMarkets.js --network flowTestnet
```

### Network Config

```
Network:    Flow EVM Testnet
Chain ID:   545
RPC:        https://testnet.evm.nodes.onflow.org
Explorer:   https://evm-testnet.flowscan.io
Faucet:     https://faucet.flow.com (select EVM)
```

---

## 🌐 Internationalization

SabiMarkets ships with full support for 15 languages, including major African languages:

| Code | Language | Code | Language |
|---|---|---|---|
| `en` | English | `ha` | Hausa |
| `fr` | French | `yo` | Yoruba |
| `ar` | Arabic | `ig` | Igbo |
| `sw` | Swahili | `pcm` | Nigerian Pidgin |
| `am` | Amharic | `rw` | Kinyarwanda |
| `pt` | Portuguese | `so` | Somali |
| `tw` | Twi | `xh` | Xhosa |
| `zu` | Zulu | | |

Market questions and descriptions are auto-translated server-side on first load.

---

## 📁 Project Structure

```
sabimarkets/
├── src/
│   ├── app/              # Next.js App Router (pages + API routes)
│   ├── components/       # React components
│   ├── lib/              # Smart contract ABIs, API, utils
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand global state
│   └── i18n/             # next-intl routing + messages
├── smartcontracts/       # Hardhat project (Solidity contracts)
│   ├── contracts/        # SabiMarket.sol, Factory, MockUSDC
│   └── scripts/          # deploy.js, seedMarkets.js
├── prisma/               # Database schema (PostgreSQL)
├── messages/             # i18n JSON per locale (15 languages)
└── public/               # Static assets
```

---

## 📜 License

MIT License

---

## 🔗 Links

- **Live App:** [testnet.sabimarket.xyz](https://testnet.sabimarket.xyz)
- **Contract Explorer:** [evm-testnet.flowscan.io](https://evm-testnet.flowscan.io/address/0xE7579839f736Be431750DCC8715de34305C71c4E)
- **Flow EVM Docs:** [developers.flow.com/evm](https://developers.flow.com/evm)

---

*Built for Africa. Powered by Flow.*
