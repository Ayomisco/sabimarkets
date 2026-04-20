# SabiMarkets — Africa's Prediction Market on Stellar

> Decentralized prediction markets built natively for Africa, powered by Stellar Soroban smart contracts.

---

## Live Deployment

| Resource | Link |
|---|---|
| **Live App** | https://testnet.sabimarket.xyz |
| **Network** | Stellar Testnet |
| **Explorer** | https://stellar.expert/explorer/testnet |
| **Wallet** | [Freighter](https://www.freighter.app/) (Stellar browser wallet) |

### Deployed Contracts (Stellar Testnet)

| Contract | Address |
|---|---|
| **MockUSDC** | `CDDEX6FS3GISJG366H7RRP432UZ6P3QBDWFFF6RBQE3D7F6KQ4SNFSWC` |
| **SabiMarketFactory** | `CDGM6NNJGNSI36L32A4NDVVJXMU4CPDNYERPR6F44SPRWCAMOGHE6OHP` |
| **CLOBExchange** | `CBCCF22KDF6UMKX6QCKNQ6LE4ROEOIAZEHO7ZJKUANKN6FF5MLWXUJ6O` |
| **OracleResolver** | `CCZCR627NOPJGWSQ7W7SRFM5YXTUCJ4MLUEKFZJXHTEIAZWYXROHHZK2` |

---

## What is SabiMarkets?

**SabiMarkets** is a fully on-chain decentralized prediction market built natively for Africa on the **Stellar blockchain**. Users connect their Freighter wallets, browse real African and global prediction markets, and trade YES/NO binary outcome shares using USDC — entirely on-chain, with no intermediaries.

SabiMarkets is:

- **Africa-first** — Markets curated around African politics, economics, sports, and culture
- **Multilingual** — 16 African and global languages supported out of the box
- **Truly on-chain** — Every trade is a direct Soroban contract invocation via Freighter
- **CLOB-ready** — Central Limit Order Book exchange for advanced order matching
- **Oracle-agnostic** — Flexible resolution: Optimistic, Direct, AI commit-reveal, or MultiSig
- **Low cost** — Stellar's native fee model keeps transactions near-zero

---

## Features

- **Live Prediction Markets** — On-chain African and global markets
- **16 Languages** — English, French, Arabic, Hausa, Yoruba, Igbo, Swahili, Amharic, Nigerian Pidgin, Kinyarwanda, Somali, Portuguese, Twi, Xhosa, Zulu, Luganda
- **On-Chain Trading** — Direct `buy_shares` / `sell_shares` via Soroban contracts through Freighter
- **USDC Collateral** — Stellar-native USDC with on-chain allowance
- **CLOB Exchange** — Polymarket CTF-inspired operator-gated order matching (Normal / Mint / Merge)
- **Multi-Path Resolution** — Optimistic (1h challenge window), Direct, AI commit-reveal, MultiSig
- **Market Creation** — Permissionless market creation via the factory contract
- **Real-Time Charts** — Live probability charts with animated transitions
- **Portfolio Tracker** — On-chain positions reader (YES/NO shares per market)
- **Comment System** — Threaded market discussions (PostgreSQL)
- **Admin Dashboard** — Market moderation and user management
- **Analytics** — User activity tracking and market view analytics
- **Faucet** — 10,000 test USDC mintable per address

---

## Architecture

### Smart Contracts (`/smartcontract-stellar`)

Five Soroban contracts on Stellar Testnet:

```
contracts/
├── mock-usdc/          # SAC-compatible test USDC (6 decimals, faucet)
├── sabimarket/         # Binary prediction market (AMM pricing, 1% fee)
├── sabimarket-factory/ # Market registry (by category, creator)
├── clob-exchange/      # CLOB order matching (Normal/Mint/Merge)
└── oracle-resolver/    # Multi-path oracle resolution
```

See [smartcontract-stellar/README.md](../smartcontract-stellar/README.md) for full contract API reference.

### Frontend (`/sabimarkets`)

```
src/
├── app/[locale]/
│   ├── page.tsx          # Homepage (server component, fetches markets from Stellar)
│   ├── create/           # Market creation flow (5-step wizard)
│   └── settings/
├── components/
│   ├── FeedAndPortfolio.tsx  # Main feed + portfolio tabs
│   ├── BetModal.tsx          # Trade modal (Freighter + Soroban invocations)
│   └── WalletMenu.tsx        # Freighter connect/disconnect/balance
├── lib/
│   └── stellar/
│       ├── contracts.ts      # Contract addresses + XDR specs
│       ├── client.ts         # SorobanRpc.Server setup
│       ├── api.ts            # fetchMarkets from factory
│       └── wallet.ts         # Freighter helpers
└── store/
    ├── marketStore.ts
    └── portfolioStore.ts
```

### Database (Prisma + PostgreSQL)

Off-chain data only — comments, analytics, market curation, user sessions. All financial positions are read directly from Stellar via Soroban RPC.

---

## Getting Started

### Prerequisites

- Node.js 20+
- [Freighter wallet](https://www.freighter.app/) browser extension
- PostgreSQL (or Neon serverless)

### Installation

```bash
cd sabimarkets
npm install
cp .env.example .env.local
```

Configure `.env.local`:

```env
DATABASE_URL=postgresql://...

# Stellar contract addresses
NEXT_PUBLIC_STELLAR_USDC=CDDEX6FS3GISJG366H7RRP432UZ6P3QBDWFFF6RBQE3D7F6KQ4SNFSWC
NEXT_PUBLIC_STELLAR_FACTORY=CDGM6NNJGNSI36L32A4NDVVJXMU4CPDNYERPR6F44SPRWCAMOGHE6OHP
NEXT_PUBLIC_STELLAR_CLOB=CBCCF22KDF6UMKX6QCKNQ6LE4ROEOIAZEHO7ZJKUANKN6FF5MLWXUJ6O
NEXT_PUBLIC_STELLAR_ORACLE=CCZCR627NOPJGWSQ7W7SRFM5YXTUCJ4MLUEKFZJXHTEIAZWYXROHHZK2
NEXT_PUBLIC_STELLAR_RPC=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

```bash
npx prisma migrate dev
npm run dev
```

### Get Test USDC

In the app click **Get USDC** in the wallet menu, or run:

```bash
cd ../smartcontract-stellar
bash scripts/faucet.sh YOUR_STELLAR_G_ADDRESS
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Stellar / Soroban |
| **Smart Contracts** | Rust (soroban-sdk v22) |
| **Wallet** | Freighter (`@stellar/freighter-api`) |
| **Stellar SDK** | `@stellar/stellar-sdk` |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand |
| **Database** | Prisma + PostgreSQL (Neon) |
| **i18n** | next-intl (16 languages) |
| **Error Tracking** | Sentry |

---

## License

MIT
