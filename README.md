# 🌍 SABI Markets

> Africa's Premier Prediction Market Platform

**SABI Markets** is a decentralized prediction market platform built specifically for African users, powered by Polymarket's CLOB and deployed on Polygon.

## ✨ Features

- 🌍 **Africa-First** - Curated markets relevant to African users
- 🌐 **15 Languages** - English, French, Arabic, Hausa, Yoruba, Igbo, Swahili, Portuguese, and more
- ⚡ **Real-Time Prices** - WebSocket integration for live market updates
- 🎯 **Multi-Outcome Markets** - Support for binary and multi-choice predictions
- 💬 **Discussion System** - Threaded comments with likes/dislikes
- 🔒 **Wallet Authentication** - WalletConnect v2 for secure trading
- 💰 **Low Fees** - Built on Polygon for $0.01 transaction costs
- 📱 **Mobile Responsive** - Optimized for all devices

## 🏗️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain:** Polygon (MATIC), USDC
- **Trading:** Polymarket CLOB API
- **Database:** PostgreSQL (Railway)
- **Authentication:** Wagmi v2, WalletConnect v2
- **Deployment:** Vercel Edge Network

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- WalletConnect Project ID

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sabimarkets.git
cd sabimarkets

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📝 Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# WalletConnect (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"

# Polymarket Builder API (required for trading)
POLY_BUILDER_API_KEY="your-builder-api-key"
NEXT_PUBLIC_POLY_BUILDER_KEY="your-builder-api-key"

# Polygon RPC (get from https://alchemy.com/)
POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/your-key"
NEXT_PUBLIC_POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/your-key"

# Builder Wallet (receives fees)
BUILDER_WALLET_ADDRESS="0xYourAddress"
NEXT_PUBLIC_BUILDER_WALLET_ADDRESS="0xYourAddress"

# Site
NEXT_PUBLIC_SITE_URL="https://sabimarket.xyz"
```

### Required for Trading
- `POLY_BUILDER_API_KEY` - **Critical:** Get this from Polymarket Builder Grant approval
- `BUILDER_WALLET_ADDRESS` - Your EOA wallet for receiving builder fees

### Testing API Configuration
Visit `/api/health` to verify all environment variables are configured correctly.

### Troubleshooting "Unauthorized/Invalid API Key"
If you see this error:
1. Verify `POLY_BUILDER_API_KEY` is set in your environment
2. Check the API key is valid (not expired/revoked)
3. Ensure production environment variables are set in your hosting platform (Vercel/Railway)
4. Run `npm run dev` locally to test with your `.env` file
5. Check `/api/health` endpoint for configuration status

## 🎯 Project Structure

```
sabimarkets/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & API clients
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   └── i18n/             # Internationalization
├── prisma/              # Database schema
├── public/              # Static assets
├── docs/                # Documentation
└── messages/            # i18n translations
```

## 📚 Documentation

- [Platform Audit](docs/AUDIT.md) - Technical audit and roadmap
- [Launch Strategy](docs/LAUNCH_STRATEGY.md) - Go-to-market plan
- [Architecture](docs/architecture.md) - System design

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- **Website:** [sabimarket.xyz](https://sabimarket.xyz)
- **Twitter:** [@sabimarkets](https://twitter.com/sabimarkets)
- **Built with:** [Polymarket](https://polymarket.com) • [Polygon](https://polygon.technology) • [Vercel](https://vercel.com)

---

**Built with ❤️ for Africa**
