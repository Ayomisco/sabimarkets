# Polymarket Builder Program Application Draft

**Website:** https://builders.polymarket.com/
**Goal:** Apply to become an official Polymarket Builder and receive the builder's badge, API access, and potential ecosystem grants.

---

### Application Fields

**Your Project:**
`@SabiMarkets`

**Product Name:**
SabiMarkets

**Project Description:**
SabiMarkets is a localized, high-performance interface and aggregator built on top of Polymarket’s liquidity. Recognizing that Polymarket's default UI heavily caters to US-centric events (US politics, sports, indices), SabiMarkets dynamically filters, surfaces, and promotes markets related to the 54 African countries, their economies, leaders, and global events that impact emerging markets. We provide a tailored, mobile-responsive "dark mode native" terminal that allows African users to bet on the outcomes that directly affect their daily lives, driving entirely new volume to Polymarket from one of the fastest-growing Web3 demographics.

**Current MVP State & Grant Request:**
The current SabiMarkets MVP operates as a High-Fidelity Simulation (Demo Mode). Our frontend indexing engine successfully pulls live 1-to-1 data from Polymarket, and the UI prompts real Web3 wallets (via `wagmi`) to sign an EIP-712 security payload when placing an order. However, it does not currently execute on the Polymarket matching engine. Real Polymarket trading requires a complex "CTF Proxy Wallet" integration (deploying a proxy smart contract per user, funding with USDC, setting infinite allowances, and managing the `@polymarket/clob-client` binary payloads via the `/order` endpoint). 

We have successfully built the localized UI, the African indexing engine, and validated product-market fit. We are applying for the Builder Grant specifically to fund the necessary Web3 engineering to complete the CTF Proxy Wallet integration and take SabiMarkets to production.

---

**Project Description (Alternative Short Version):**
SabiMarkets is a localized frontend for Polymarket specifically tailored to the African demographic. We filter and surface markets relating to all 54 African countries—focusing on local politics, sports, and economies—providing a frictionless "dark mode" terminal for emerging market users. 

Our current MVP fully implements the UI and live Polymarket CLOB/Gamma indexing using our African filtering algorithm. We are applying for the Builder Grant to fund the Web3 engineering required to build out the CTF Proxy Wallet execution layer (via `@polymarket/clob-client`) so we can seamlessly route real African liquidity into Polymarket's smart contracts.

**Website URL:**
https://sabimarkets.xyz (Purchasing soon)
*(Temporary Production URL: https://sabimarkets-YOUR_VERCEL_ID.vercel.app)*

**Email:**
[Your Email]

**X Handle:**
[@Your_X_Handle]

**Telegram Handle:**
[@Your_Telegram_Handle]

**Builder API key:**
`019a500c-f1a7-737d-88ad-788a12422964` (As defined in our `.env` via `NEXT_PUBLIC_POLY_BUILDER_KEY`)

---

### Tips for Posting on X (Twitter)
When you announce SabiMarkets on X after buying the domain, make sure to tag `@Polymarket` and highlight the core value proposition:
> **Draft Tweet:**
> "The world's largest prediction market is heavily focused on the US. But what about the rest of the world? 🌍
> 
> Today I'm launching **SabiMarkets** (@SabiMarkets) — a deeply localized frontend for @Polymarket that brings deep liquidity to African politics, sports, and economies. 
> 
> Predict the outcome of things that actually matter to you. Built for the culture. Localized UI. Global liquidity.
> 
> Try it now: sabimarkets.xyz 🚀⚡️"
