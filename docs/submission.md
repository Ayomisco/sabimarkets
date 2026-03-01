# SabiMarket - Polygon Buildathon Submission

Here is the exact record of the product submission details used for the Polygon Buildathon on Akindo.io.

## Basic Information

- **Product Name:** SabiMarket
- **Tagline:** Africa's first prediction market on Polygon — bet in 16 languages.
- **Product Type:** Functional
- **Live Demo:** https://sabimarket.xyz
- **Deliverable URL:** https://github.com/Ayomisco/sabimarkets
- **Build with:** Polygon, Polymarket, WalletConnect, Vercel
- **Tags:** Next.js, Polygon, Polymarket, wagmi, viem, RainbowKit, TypeScript, EIP-712, CLOB, i18n
- **Product Category:** Prediction Market, DeFi, Market Infrastructure

---

## About

### What it does
SabiMarket is Africa's native prediction market — a localised, mobile-first trading interface built on top of Polymarket's infrastructure on Polygon. Users can:
- Browse and trade on live African markets (politics, sports, economy, crypto)
- Place real YES/NO orders via EIP-712 signed CLOB orders routed through Polymarket
- Connect any wallet (MetaMask, WalletConnect, Coinbase) on desktop and mobile
- Use the platform in 16 African languages — Hausa, Yorùbá, Swahili, Français, Igbo, Amharic, Kinyarwanda, Luganda, Twi, Amazigh, Somali, and more
- Track real on-chain positions fetched live from the Polymarket Gamma API

### The problem it solves
Polymarket is inaccessible to Africa's 1.4 billion people.
- Zero African language support
- No localised UX or currency context
- Mobile wallets not properly deep-linked for African users
- African events (AFCON, ECOWAS elections, naira/rand rates) barely exist as markets

SabiMarket solves all of this — a fully localised distribution layer for Polymarket that brings real prediction market trading to the most underserved continent in Web3.

### Challenges I ran into
- **Language routing with Next.js App Router** — next-intl's soft navigation doesn't re-run server components, so translated market data reverted to English after switching. Fixed by replacing `router.replace()` with hard `window.location.href` navigation.
- **Mobile wallet deep-links** — WalletConnect project ID must be registered; placeholder IDs silently fail on mobile.
- **CLOB order relay** — Polymarket's EIP-712 domain + typed data structure is complex. Implemented full signing flow with wagmi's `useSignTypedData` and a server-side relay API route that tags each order with our builder wallet for fee attribution.
- **African market filtering** — Polymarket lists 50,000+ markets. Built a keyword-based filter with 80+ African country/city/event terms plus a smart backfill to ensure minimum 24 markets always display.

### Technologies I used
- **Polygon** — all trades settle on Polygon via Polymarket's CTF Exchange (`0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E`)
- **Polymarket CLOB API** — order routing, order book, position tracking
- **Polymarket Builder Program** — builder key for fee rebates sent to our Polygon wallet
- **Next.js 16** (App Router, Server Components, API Routes)
- **wagmi + viem** — EIP-712 typed data signing, USDC balance reads
- **RainbowKit** — wallet connection with WalletConnect v3 deep-links
- **next-intl** — 16-language i18n routing
- **Google Translate API** — server-side auto-translation of Polymarket market data
- **Vercel** — deployment with Edge network
- **Sentry + Vercel Analytics** — production monitoring

### How we built it
1. **Market feed** — Server component fetches from `gamma-api.polymarket.com`, filters to African markets, auto-translates questions/descriptions server-side per locale before rendering
2. **Order flow** — `BetModal` builds an EIP-712 typed order → user signs with wallet → signed order POSTed to `/api/clob/order` (Next.js API route) → server tags with builder wallet and relays to Polymarket CLOB
3. **Portfolio** — Real positions fetched from `gamma-api.polymarket.com/positions?user=0x...` — no localStorage simulation
4. **Revenue** — 0.5% spread markup applied at order price + Polymarket builder fee rebates auto-sent to `0x8f0E9b15028311F263be1B71c1D5d8Ae8a35294e`
5. **Mobile** — bottom-sheet modals, WalletConnect deep-links, full-screen language picker

### What we learned
- The **African market is massively hungry for Web3 financial tools** — existing platforms are built for a Western user with a laptop and a Coinbase account
- **Distribution is the moat**, not the DEX — Polymarket is the liquidity layer; SabiMarket is the cultural and linguistic access layer
- Localisation is engineering work, not just translation — routing, RTL support for Arabic, font rendering for Amharic/Ethiopic scripts
- Builder programs like Polymarket's are a **sustainable revenue model for frontend builders** — meaningful fee rebates from day one without raising capital

### What's next for SabiMarket
- **SabiProxy Factory** — Solidity contract deploying to Polygon Mainnet to manage per-user proxy wallets (already written, on Amoy testnet)
- **Expand to 30+ African languages** — Fula, Tigrinya, Dioula, Shona, Oromo
- **African-native markets** — work with Polymarket to list markets on AFCON, African elections, naira/rand FX rates
- **Referral system** — fee split between SabiMarket and users who onboard their community
- **PWA + push notifications** — market resolution alerts, position updates

---

## Buildathon Waves & Milestones

### Updates in this Wave (6th Wave)
In this 6th Wave, we built the complete SabiMarket MVP from scratch and deployed it live to production. 

Deliverable URL: https://sabimarket.xyz
GitHub: https://github.com/Ayomisco/sabimarkets

Key updates in this Wave:
- **Live Production Frontend**: Deployed a fully functional, mobile-first Web3 application on Vercel.
- **African i18n Engine**: Implemented native support for 16 African languages, complete with automatic server-side translation of live Polymarket data.
- **EIP-712 CLOB Trading**: Built a secure order relay API. Users sign EIP-712 typed data via their Polygon wallet (WalletConnect/MetaMask), and our backend applies the builder fee attribution before relaying to the Polymarket Central Limit Order Book.
- **On-Chain Portfolio Widget**: Removed simulated data and wired up the Polymarket Gamma API to fetch the user's real open positions, average entry prices, and live P&L directly from the blockchain.
- **Revenue Model Live**: Successfully implemented a 0.5% spread markup mechanism alongside Polymarket Builder Program fee rebates.

### Milestone: 7th Wave
In the 7th Wave, we will focus on smart contract infrastructure and seamless UX:

1. **SabiProxyFactory Deployment to Polygon Mainnet**: We will deploy our custom proxy wallet factory contract. This enables SabiMarket to automatically deploy lightweight proxy contracts for users (mirroring Polymarket's CTF Exchange logic), removing the need for manual, repetitive USDC approvals on every trade.
2. **Referral Engine**: Develop a smart referral system that shares a percentage of SabiMarket's spread revenue with users who onboard their local communities onto Polygon.
3. **Advanced Analytics**: Add live candlestick charting for prediction market tokens and a global leaderboard to gamify the prediction experience for African users.

### Milestone: 8th Wave
In the 8th Wave, we will expand liquidity, fiat onboarding, and mobile presence:

1. **African-Native Market Generation**: Launch "Sabi Oracles," a framework that pulls localized African events (e.g., Nigerian Elections, AFCON tournaments, local crypto adoption metrics) and proposes them as active markets on Polymarket using the UMA optimistic oracle.
2. **Fiat On-Ramp Integration**: Partner with African crypto payment gateways (like YellowCard or Paystack) to allow users to deposit local fiat currencies (Naira, Rand, Cedis) directly into Polygon USDC within the SabiMarket UI.
3. **PWA & Notifications**: Transition the Web App into a full Progressive Web App (PWA) with push notifications to alert users of market resolutions and rapid probability shifts.
