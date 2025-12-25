# Product Requirements

Who is the product for?

The product is for small streamers who don't have the power and the fame to actually moneitze their streams. These guys are often young and trying to make a name for themelvess in the entertainment space. They would love to have an early source of income that gives them motivation and resources to be grow as a streamer while also giving him motivation to do more and more entertaining stuff as investors would give ideas in the wantingness of improving their investment. This product is also for investors/crypto traders that are interested in making money through meme coins such as these while also being entrertained by these streamers. This can be analogous to sports betting as betting on a sports just makes the sports watching experience much more enjoyable but this is similar but for streaming.

What problems does it solve?

This solves the problem of small streamers not having any money as they get paid through creator fees. This also gives them motivations to better streamers as they know investors depend on the streamer and have conviction to bet on their success. Small streamers are finally going to statt being more noticed than bigger streamers as people would be more excited to watch smaller streamers in the odd chance that their investment 100x, thus solving the problem that small streamers get no viewers and no one gives them a chance. Traders are also finally able to be actually entertained and be given the same "sports betting" feel but in streaming rather than having to watch sports, which this generation is less likely to do regardless.

What does the product do?

The product connects a streamer's live stream to a token/meme coin that is made through our launchpad on the solana chain. This runs off a bonding curve and as investors trade the coin, they pay a percentage fee to us (our app) to be given the privelege of trading for these streamers and a percentage of that goes directly to the streamers while we keep a percentage as well, thus making it a win win win. The platform also motivates streamers to stream for longer as when they stop streaming, people can still trade their token but the amount of fees they get is drastically reduced.

Experience:

Streamer goes to our site, signs in through a phantom wallet. After connecting his wallet, he is asked wether he is a streamer or a trader. He clicks streamer and is automatically sent to the streamer portal. At the streamer portal he is given the option to start stream. He is told put in what platform he will be streaming on and then providing hsi username for that specific platform. Then he would be asked to give his token a name, ticker, and thumbnail. He would be reminded that his coin can only be made once and can not be edited after launch to site. He clicks launch and the token is deployed. He is able to buy into his coin before anyone else but is also required to freeze his tokens to proceed if he picks this option to mantain long term stability, if he refuses he gets given a red flag on his token and pprofile.

---

# Tech Stack

## Frontend
- **Next.js 14+** - Full-stack React framework with SSR/SSG capabilities
- **React 18** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS + DaisyUI** - Utility-first CSS framework with pre-built components
- **@solana/wallet-adapter-react** - Phantom wallet integration
- **@solana/web3.js** - Solana blockchain interaction library
- **Chart.js / TradingView Lightweight Charts** - Real-time trading charts

## Backend
- **Next.js API Routes** - Serverless backend functions
- **Node.js** - JavaScript runtime
- **Anchor Framework** - Solana smart contract development (Rust)

## Database & Storage
- **Supabase (PostgreSQL)** - Primary database with real-time capabilities
  - User profiles and streamer data
  - Token metadata and trading history
  - Real-time subscriptions for live updates
- **Alternative**: Firebase Firestore for real-time document database

## Blockchain
- **Solana Devnet** - Development and testing environment
- **Solana Mainnet-Beta** - Production blockchain
- **Metaplex Token Metadata Program** - Token standard for NFT-like metadata
- **SPL Token Program** - Token creation and management
- **Helius RPC** - Enhanced Solana RPC with webhooks and monitoring

## Real-Time Infrastructure
- **Supabase Realtime** - Database-driven real-time updates
- **Solana WebSocket** - Onchain account change monitoring
- **Socket.io** - Client-server WebSocket communication for trading updates
- **Binance/Coinbase WebSocket APIs** - Market data reference (if needed)

## External APIs
- **Twitch API** - Stream status verification and streamer data
- **YouTube Live API** - Future integration for YouTube streamers
- **Kick API** - Future integration for Kick streamers

## Hosting & Deployment
- **Vercel** - Frontend and API hosting with automatic deployments
- **GitHub** - Version control and CI/CD pipeline
- **Cloudflare** - CDN and DDoS protection

## Development Tools
- **create-solana-dapp** - Project scaffolding CLI
- **Anchor CLI** - Smart contract development and deployment
- **Solana CLI** - Blockchain interaction and wallet management
- **ESLint + Prettier** - Code quality and formatting

---

# Tech Architecture

## System Overview
Zeroglaze is a decentralized application (dApp) that bridges Web2 streaming platforms with Web3 tokenomics on the Solana blockchain. The architecture follows a hybrid approach combining centralized real-time services with decentralized blockchain operations.

## Architecture Layers

### 1. Presentation Layer (Frontend)
```
User Interface (Next.js + React)
├── Streamer Portal
│   ├── Wallet Connection (Phantom)
│   ├── Stream Platform Selection
│   ├── Token Launch Interface
│   └── Creator Dashboard
├── Trader Portal
│   ├── Token Discovery
│   ├── Trading Interface
│   ├── Real-time Charts
│   └── Portfolio Management
└── Shared Components
    ├── Wallet Adapter
    ├── Transaction Handlers
    └── Real-time Updates
```

### 2. Application Layer (Backend)
```
Next.js API Routes (Serverless Functions)
├── /api/streamer
│   ├── POST /create-token - Validate & initiate token creation
│   ├── GET /verify-stream - Check if streamer is live
│   └── GET /profile - Fetch streamer data
├── /api/trading
│   ├── POST /buy - Execute buy transaction
│   ├── POST /sell - Execute sell transaction
│   └── GET /price - Get current token price
├── /api/webhook
│   └── POST /stream-status - Receive stream status updates
└── /api/admin
    └── Platform management endpoints
```

### 3. Data Layer
```
Supabase (PostgreSQL)
├── Tables
│   ├── users (wallet_address, role, created_at)
│   ├── streamers (user_id, platform, username, token_address, is_live)
│   ├── tokens (address, name, ticker, creator, market_cap, bonding_curve_params)
│   ├── trades (token_address, trader, type, amount, price, timestamp)
│   └── fees (token_address, platform_fees, creator_fees, timestamp)
└── Real-time Subscriptions
    ├── Token price changes
    ├── Stream status changes
    └── Trade executions
```

### 4. Blockchain Layer (Solana)
```
Solana Programs (Smart Contracts)
├── Token Launchpad Program
│   ├── create_token() - Deploy new SPL token
│   ├── initialize_bonding_curve() - Set up pricing mechanism
│   └── freeze_creator_tokens() - Lock creator allocation
├── Trading Program
│   ├── buy_tokens() - Purchase tokens following bonding curve
│   ├── sell_tokens() - Sell tokens following bonding curve
│   ├── calculate_price() - Dynamic price based on supply
│   └── distribute_fees() - Split fees between platform & creator
└── Fee Distribution Program
    ├── collect_platform_fees() - Collect trading fees
    └── distribute_creator_fees() - Send fees to streamer wallet
```

## Data Flow Diagrams

### Token Creation Flow
```
1. Streamer connects Phantom wallet → Frontend
2. Frontend validates wallet → Next.js API
3. API checks if streamer already has token → Supabase
4. Streamer submits token details (name, ticker, thumbnail) → Frontend
5. Frontend calls create_token endpoint → Next.js API
6. API triggers Solana program → Blockchain
7. Smart contract deploys SPL token → Solana
8. Token metadata stored → Supabase + Metaplex
9. Stream verification webhook registered → Twitch API
10. Confirmation returned → Frontend
```

### Real-Time Trading Flow
```
1. Trader selects token & amount → Frontend
2. Frontend calculates price via bonding curve → Client-side
3. Trader confirms transaction → Phantom wallet
4. Transaction sent → Solana blockchain
5. Smart contract executes trade:
   - Updates token supply
   - Calculates new price
   - Deducts fees (platform + creator)
   - Transfers tokens to trader
6. Transaction confirmed → Blockchain
7. Event emitted → Solana WebSocket
8. Database updated (trade history, price) → Supabase
9. Real-time update pushed → All connected clients via Supabase Realtime
10. Chart updates → Frontend
```

### Stream Status Monitoring Flow
```
1. Backend polls Twitch API every 60 seconds → Twitch
2. Stream status retrieved (live/offline) → API response
3. Status compared with database → Supabase
4. If status changed:
   - Update streamer.is_live → Supabase
   - Trigger fee adjustment → Smart contract
   - Push real-time update → All clients
5. If live: Creator fees = 100%
6. If offline: Creator fees = 10% (reduced)
```

## Security Architecture

### Wallet Security
- Private keys never leave user's Phantom wallet
- All transactions require explicit user approval
- No backend custody of user funds

### API Security
- Rate limiting on all endpoints (prevent spam)
- CORS restrictions (allowed origins only)
- Input validation and sanitization
- SQL injection prevention via parameterized queries

### Smart Contract Security
- Token freeze mechanism to prevent creator rug pulls
- Maximum transaction limits to prevent manipulation
- Time-locked withdrawals for platform fees
- Automated security audits before mainnet deployment

### Data Security
- Row-level security (RLS) in Supabase
- Encrypted connections (HTTPS/WSS)
- No PII stored (only wallet addresses)
- Secure environment variable management

## Scalability Strategy

### Phase 1 (MVP - Devnet)
- Single Solana RPC endpoint
- Basic Supabase free tier
- Vercel free tier hosting
- Handle ~100 concurrent users

### Phase 2 (Launch - Mainnet)
- Multiple RPC endpoints with load balancing
- Supabase Pro tier with connection pooling
- Vercel Pro tier with edge functions
- CDN caching for static assets
- Handle ~10,000 concurrent users

### Phase 3 (Growth)
- Dedicated Solana RPC infrastructure (Helius/QuickNode)
- Database read replicas for query optimization
- Redis caching layer for frequently accessed data
- WebSocket connection pooling
- Horizontal scaling via serverless architecture
- Handle ~100,000+ concurrent users

## Monitoring & Observability
- **Error Tracking**: Sentry for frontend/backend errors
- **Analytics**: Vercel Analytics + Google Analytics
- **Blockchain Monitoring**: Helius webhooks for transaction tracking
- **Performance**: Lighthouse CI for frontend performance
- **Uptime**: UptimeRobot for endpoint monitoring

---
