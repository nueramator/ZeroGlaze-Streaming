# Zeroglaze MVP - Stream. Trade. Earn.

The first streamer-focused token launchpad with bonding curves on Solana.

## Project Overview

Zeroglaze enables streamers to create tradable tokens tied to their streaming activity. Traders can buy/sell these tokens on a bonding curve, with prices influenced by whether the streamer is live.

### Key Features

- **Wallet Integration**: Connect with Phantom or Solflare wallets
- **Token Creation**: Streamers create tokens in minutes via a multi-step wizard
- **Bonding Curve Trading**: Instant liquidity with automated price discovery
- **Live Stream Bonus**: Streamers earn 2% fees when streaming live
- **Real-time Updates**: Track which streamers are currently live

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, DaisyUI
- **Blockchain**: Solana (Devnet for MVP)
- **Wallet**: @solana/wallet-adapter (Phantom, Solflare)
- **Database**: Supabase (PostgreSQL)
- **Smart Contracts**: Anchor Framework (Rust)
- **Integrations**: Twitch API

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Phantom wallet (browser extension)
- Solana wallet with Devnet SOL ([Faucet](https://faucet.solana.com/))

### Installation

1. **Clone and install dependencies**:
```bash
git clone <your-repo-url>
cd Zeroglaze_Project
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Solana
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=ZERO11111111111111111111111111111111111111111

# Optional: Twitch (for stream verification)
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
```

3. **Set up Supabase database**:

Create a new Supabase project at [supabase.com](https://supabase.com), then run migrations:

```bash
# Option 1: Using Supabase CLI
npx supabase db push

# Option 2: Manual - Copy and run SQL from supabase/migrations/
# - 001_initial_schema.sql
# - 002_seed_data.sql
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Zeroglaze_Project/
├── app/                      # Next.js 14 App Router
│   ├── api/                  # API routes
│   │   ├── streamer/         # Streamer endpoints (create-token, verify, etc)
│   │   ├── trading/          # Trading endpoints (buy, sell, quote)
│   │   ├── tokens/           # Token listing and details
│   │   └── webhook/          # Stream status webhooks
│   ├── streamer/             # Streamer portal page
│   ├── trader/               # Trader portal page
│   ├── layout.tsx            # Root layout with wallet provider
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/
│   ├── providers/            # Wallet provider context
│   ├── layout/               # Navbar, Footer
│   ├── streamer/             # Token creation wizard
│   └── trader/               # Token list, trading interface
├── lib/
│   ├── solana/               # Solana connection, program interaction
│   ├── supabase/             # Supabase client and types
│   ├── integrations/         # Twitch API integration
│   ├── utils/                # Bonding curve, validation, errors
│   └── types/                # TypeScript types
├── supabase/
│   └── migrations/           # Database schema and seed data
└── programs/
    └── zeroglaze/            # Anchor smart contract (Rust)
```

## User Flows

### For Streamers

1. **Connect Wallet** - Use Phantom or Solflare
2. **Select Platform** - Choose Twitch (YouTube coming soon)
3. **Verify Account** - Link your streaming account
4. **Configure Token** - Set name, symbol, supply, image
5. **Choose Options** - Enable/disable freeze authority
6. **Create Token** - Confirm and deploy to Solana

### For Traders

1. **Connect Wallet** - Use Phantom or Solflare
2. **Browse Tokens** - See all available streamer tokens
3. **Check Live Status** - See who's streaming (marked with LIVE badge)
4. **Trade** - Buy or sell on the bonding curve
5. **Watch Price** - Price updates based on supply/demand

## Features

### Completed (MVP)

- ✅ Wallet connection (Phantom, Solflare)
- ✅ Homepage with role selection
- ✅ Streamer portal with token creation wizard
- ✅ Trader portal with token discovery
- ✅ Trading interface (buy/sell)
- ✅ Bonding curve price calculation
- ✅ Live stream status indicators
- ✅ Database schema and migrations
- ✅ API endpoints for all core flows

### In Progress

- 🔄 Smart contract deployment
- 🔄 Actual Solana transaction execution
- 🔄 Twitch API integration

### Coming Soon

- 📋 Real-time price charts
- 📋 Transaction history
- 📋 Portfolio tracking
- 📋 Advanced analytics
- 📋 YouTube integration
- 📋 Mobile app (PWA)

## API Endpoints

### Streamer APIs
- `POST /api/streamer/create-token` - Create a new token
- `POST /api/streamer/verify-stream` - Verify streamer account
- `GET /api/streamer/profile` - Get streamer profile

### Trading APIs
- `POST /api/trading/buy` - Buy tokens
- `POST /api/trading/sell` - Sell tokens
- `POST /api/trading/quote` - Get price quote

### Token APIs
- `GET /api/tokens/list` - List all tokens
- `GET /api/tokens/[mint]` - Get token details

### Webhook
- `POST /api/webhook/stream-status` - Update stream status (Twitch EventSub)

## Database Schema

### Key Tables
- **streamers** - Streamer profiles and verification
- **tokens** - Token metadata and configuration
- **trades** - Trading history
- **stream_status** - Real-time stream status
- **earnings** - Streamer earnings from fees

## Bonding Curve

Uses a **linear bonding curve** for MVP:

```
price = basePrice + (tokensSold * slope)
```

- **Base Price**: 0.001 SOL
- **Slope**: 0.00001 SOL per token
- **Platform Fee**: 1%
- **Streamer Fee**: 2% (only when live)

## Development Scripts

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Smart Contracts (if needed)
npm run anchor:build   # Build Anchor program
npm run anchor:deploy  # Deploy to Devnet
npm run anchor:test    # Run Anchor tests
```

## Environment Variables

See `.env.example` for all required variables:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SOLANA_RPC_ENDPOINT`

### Optional (for full functionality)
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `NEXT_PUBLIC_PROGRAM_ID`

## Testing

### Manual Testing Flow

1. **Get Devnet SOL**:
   - Install Phantom wallet
   - Switch to Devnet
   - Get SOL from [faucet](https://faucet.solana.com/)

2. **Test Streamer Flow**:
   - Go to `/streamer`
   - Connect wallet
   - Create a token (uses mock data for MVP)

3. **Test Trading Flow**:
   - Go to `/trader`
   - Connect wallet
   - Select a token from the list
   - Try buying/selling

## Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Database (Supabase)

Already hosted on Supabase Cloud. Just run migrations in your Supabase project.

### Smart Contracts (Solana Devnet)

```bash
npm run anchor:build
npm run anchor:deploy
# Copy the program ID to .env as NEXT_PUBLIC_PROGRAM_ID
```

## Troubleshooting

### Wallet won't connect
- Make sure you're on Devnet in Phantom settings
- Try refreshing the page
- Clear browser cache

### Transactions failing
- Ensure you have Devnet SOL
- Check console for error messages
- Verify RPC endpoint is responding

### Database errors
- Check Supabase credentials in `.env`
- Verify migrations have been run
- Check RLS policies in Supabase dashboard

## Contributing

This is an MVP. Contributions welcome! Focus areas:

1. Smart contract implementation
2. Real-time chart integration
3. Advanced trading features
4. Mobile responsiveness improvements
5. Test coverage

## License

MIT

## Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- Discord: [Coming Soon]

## Roadmap

### Phase 1 (Current - MVP)
- Basic token creation
- Simple trading interface
- Devnet deployment

### Phase 2 (Next 2 weeks)
- Smart contract audit
- Mainnet deployment
- Real-time charts

### Phase 3 (1 month)
- YouTube integration
- Advanced analytics
- Mobile app (PWA)

### Phase 4 (2 months)
- Governance features
- DAO integration
- Cross-platform expansion

---

**Built with ⚡ on Solana**

*Zeroglaze - Making streaming more rewarding*
