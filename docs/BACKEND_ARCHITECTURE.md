# Zeroglaze Backend Architecture

Complete backend implementation for the Zeroglaze MVP - a streamer-focused token launchpad with bonding curves.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Solana Smart Contracts](#solana-smart-contracts)
3. [Next.js API Routes](#nextjs-api-routes)
4. [Database Design](#database-design)
5. [External Integrations](#external-integrations)
6. [Deployment Guide](#deployment-guide)
7. [Security Considerations](#security-considerations)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (Next.js Client)                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── Wallet Adapter (Phantom, Solflare)
             │
┌────────────▼────────────────────────────────────────────────┐
│                      Next.js API Routes                      │
│  /api/streamer/*  /api/trading/*  /api/tokens/*  /api/webhook/*
└────┬────────────────────┬───────────────────────┬───────────┘
     │                    │                       │
     │                    │                       │
┌────▼────────┐   ┌──────▼──────┐   ┌───────────▼───────────┐
│  Supabase   │   │   Solana    │   │  External APIs        │
│  PostgreSQL │   │   Anchor    │   │  (Twitch, YouTube)    │
│             │   │   Program   │   │                       │
└─────────────┘   └─────────────┘   └───────────────────────┘
```

### Tech Stack

- **Smart Contracts**: Rust + Anchor Framework
- **API Layer**: Next.js 14 App Router (API Routes)
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Solana (SPL Token, Anchor)
- **Real-time**: Supabase Realtime + Solana WebSocket
- **External APIs**: Twitch API, Helius RPC

---

## Solana Smart Contracts

### Program Structure

Location: `/programs/zeroglaze/src/`

#### Core Instructions

**1. initialize_platform**
```rust
pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    platform_fee_wallet: Pubkey,
) -> Result<()>
```
- One-time setup
- Creates global platform state PDA
- Sets platform fee wallet

**2. create_token**
```rust
pub fn create_token(
    ctx: Context<CreateToken>,
    token_name: String,
    token_symbol: String,
    token_uri: String,
    creator_twitter: String,
    creator_twitch: String,
    freeze_creator_allocation: bool,
) -> Result<()>
```
- Creates new SPL token with 1B supply
- Initializes bonding curve state
- Mints 800M to curve, 200M to creator
- Optionally freezes creator allocation

**3. buy_tokens**
```rust
pub fn buy_tokens(
    ctx: Context<BuyTokens>,
    token_amount: u64,
    max_sol_cost: u64,
) -> Result<()>
```
- Executes buy on bonding curve
- Uses constant product AMM (K = Virtual SOL × Virtual Tokens)
- Collects platform (1%) and creator (2% or 0.2%) fees
- Updates reserves and checks for graduation

**4. sell_tokens**
```rust
pub fn sell_tokens(
    ctx: Context<SellTokens>,
    token_amount: u64,
    min_sol_output: u64,
) -> Result<()>
```
- Executes sell on bonding curve
- Deducts fees before returning SOL
- Updates reserves

**5. update_stream_status**
```rust
pub fn update_stream_status(
    ctx: Context<UpdateStreamStatus>,
    is_live: bool,
) -> Result<()>
```
- Updates on-chain stream status
- Called by authorized keeper wallet
- Affects fee calculation (2% vs 0.2%)

**6. withdraw_creator_fees**
```rust
pub fn withdraw_creator_fees(
    ctx: Context<WithdrawCreatorFees>,
) -> Result<()>
```
- Allows creator to withdraw accumulated fees
- Only creator can call

#### Account Structures

**PlatformState**
```rust
pub struct PlatformState {
    pub authority: Pubkey,
    pub platform_fee_wallet: Pubkey,
    pub total_tokens_launched: u64,
    pub total_volume_sol: u64,
    pub total_fees_collected: u64,
    pub bump: u8,
}
```

**BondingCurve**
```rust
pub struct BondingCurve {
    // Metadata
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub token_name: String,
    pub token_symbol: String,
    pub token_uri: String,
    pub creator_twitter: String,
    pub creator_twitch: String,
    pub freeze_creator_allocation: bool,

    // Bonding curve parameters
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,

    // Stats
    pub tokens_sold: u64,
    pub total_volume: u64,
    pub creator_fees_collected: u64,

    // Stream status
    pub is_live_streaming: bool,
    pub last_stream_check: i64,

    // Graduation
    pub graduated: bool,
    pub created_at: i64,
    pub bump: u8,
}
```

#### PDAs (Program Derived Addresses)

```rust
// Platform state
seeds: [b"platform_state"]

// Bonding curve
seeds: [b"bonding_curve", creator.key(), token_mint.key()]

// Token mint
seeds: [b"token_mint", creator.key()]

// SOL vault for curve
seeds: [b"curve_sol_vault", bonding_curve.key()]

// Creator fee wallet
seeds: [b"creator_fee_wallet", creator.key(), token_mint.key()]
```

### Building and Deploying

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

---

## Next.js API Routes

### Streamer Endpoints

#### POST /api/streamer/create-token
Creates a new token with bonding curve.

**Request:**
```typescript
{
  tokenName: string;        // Max 32 chars
  tokenSymbol: string;      // Max 10 chars
  tokenUri: string;         // Max 200 chars, valid URL
  creatorWallet: string;    // Solana address
  creatorTwitter: string;   // Optional
  creatorTwitch: string;    // Required for stream verification
  freezeCreatorAllocation: boolean;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    tokenMint: string;
    bondingCurve: string;
    transactionSignature: string;
    tokenId: string;
  }
}
```

#### POST /api/streamer/verify-stream
Checks if streamer is currently live.

**Request:**
```typescript
{
  tokenMint: string;
  platform: 'twitch' | 'youtube';
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    isLive: boolean;
    platform: string;
    viewerCount?: number;
    streamTitle?: string;
    lastChecked: string;
  }
}
```

#### GET /api/streamer/profile?wallet=<address>
Retrieves creator profile and stats.

**Response:**
```typescript
{
  success: true,
  data: {
    wallet: string;
    tokensCreated: number;
    graduatedTokens: number;
    totalVolume: number;
    totalFeesEarned: number;
    tokens: Token[];
    recentTrades: Trade[];
  }
}
```

### Trading Endpoints

#### POST /api/trading/buy
Executes buy transaction.

**Request:**
```typescript
{
  tokenMint: string;
  tokenAmount: number;     // In base units
  maxSolCost: number;      // In SOL (slippage protection)
  buyerWallet: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    transactionSignature: string;
    tokenAmount: number;
    solAmount: number;
    totalFees: number;
    newPrice: number;
  }
}
```

#### POST /api/trading/sell
Executes sell transaction.

**Request:**
```typescript
{
  tokenMint: string;
  tokenAmount: number;
  minSolOutput: number;    // In SOL (slippage protection)
  sellerWallet: string;
}
```

**Response:** Same as buy

#### POST /api/trading/quote
Gets price quote without executing.

**Request:**
```typescript
{
  tokenMint: string;
  tokenAmount: number;
  isBuy: boolean;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    tokenAmount: number;
    solAmount: number;
    platformFee: number;
    creatorFee: number;
    totalCost: number;
    pricePerToken: number;
    priceImpact: number;     // Percentage
    currentPrice: number;
    newPrice: number;
  }
}
```

### Token Endpoints

#### GET /api/tokens/list
Lists tokens with filtering and sorting.

**Query Parameters:**
- `sort`: 'volume' | 'created' | 'price' | 'marketcap'
- `filter`: 'all' | 'live' | 'graduated' | 'active'
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```typescript
{
  success: true,
  data: TokenListItem[]
}
```

#### GET /api/tokens/[mint]
Gets detailed token information.

**Response:**
```typescript
{
  success: true,
  data: {
    tokenMint: string;
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;
    creator: string;
    creatorTwitter: string;
    creatorTwitch: string;
    freezeCreatorAllocation: boolean;
    currentPrice: number;
    marketCap: number;
    tokensSold: number;
    totalSupply: number;
    progress: number;         // 0-100%
    isLive: boolean;
    graduated: boolean;
    totalVolume: number;
    createdAt: string;
  }
}
```

### Webhook Endpoints

#### POST /api/webhook/stream-status
Receives stream status updates from Twitch/YouTube.

**Headers:**
- `x-webhook-signature`: HMAC signature for verification

**Request:**
```typescript
{
  tokenMint: string;
  platform: 'twitch' | 'youtube';
  isLive: boolean;
  viewerCount?: number;
  streamTitle?: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Stream status updated'
}
```

---

## Database Design

### Schema Overview

Location: `/supabase/migrations/001_initial_schema.sql`

#### Tables

**tokens**
- Primary storage for all token data
- Tracks bonding curve state, pricing, volume
- Stream status and creator info

**trades**
- Records all buy/sell transactions
- Links to tokens table
- Stores fees, prices, transaction signatures

**stream_events**
- Logs stream status changes
- Tracks viewer count, stream titles
- Used for analytics

**user_holdings**
- Portfolio tracking per wallet
- Calculates P&L, average buy price
- Updated via trigger on trades

**creator_profiles**
- Optional verified creator data
- Aggregated stats across all tokens

#### Key Features

**Triggers:**
- Auto-update `updated_at` timestamps
- Calculate user holdings on trade insert
- Update token stats after trades

**Functions:**
```sql
-- Update token after buy
update_token_after_buy(p_token_mint, p_tokens_sold, p_sol_amount, p_new_price)

-- Update token after sell
update_token_after_sell(p_token_mint, p_tokens_sold, p_sol_amount, p_new_price)

-- Calculate 24h metrics (run via cron)
update_24h_metrics()
```

**Views:**
- `trending_tokens`: Most volume in 24h
- `creator_leaderboard`: Top creators by volume

**Row Level Security (RLS):**
- Public read on tokens, trades, stream_events
- Authenticated users can create tokens/trades
- Users can only see their own holdings
- Service role can update everything

#### Indexes

Optimized for common queries:
- Token lookups by mint, creator, status
- Trade history by token, trader, timestamp
- Volume-based sorting
- Real-time feed queries

---

## External Integrations

### Twitch API

Location: `/lib/integrations/twitch.ts`

**Features:**
- OAuth token management (auto-refresh)
- Stream status checking
- Username verification
- EventSub webhook setup
- Batch stream checking (up to 100 at once)

**Key Functions:**
```typescript
// Check if streamer is live
checkTwitchStreamStatus(username: string): Promise<StreamStatus>

// Verify username exists
verifyTwitchUsername(username: string): Promise<boolean>

// Setup webhooks for stream.online/offline
setupTwitchWebhook(userId: string, callbackUrl: string): Promise<void>

// Batch check multiple streams
batchCheckStreams(usernames: string[]): Promise<Map<string, StreamStatus>>
```

**Webhook Flow:**
1. Token created with Twitch username
2. Backend calls `setupTwitchWebhook()`
3. Twitch sends events to `/api/webhook/stream-status`
4. Webhook verified via signature
5. On-chain state updated via `update_stream_status`
6. Fee tier changes (2% → 0.2% or vice versa)

### Solana RPC Connection Management

Location: `/lib/solana/connection.ts`

**Features:**
- Connection pooling (3 connections)
- Automatic retry logic
- WebSocket support for real-time updates
- Health checks

**Key Functions:**
```typescript
// Get connection from pool
getConnection(): Connection

// Release connection
releaseConnection(connection: Connection): void

// Retry wrapper
withRetry<T>(fn: () => Promise<T>, maxRetries: 3): Promise<T>

// Subscribe to account changes
subscribeToAccount(publicKey: string, callback): number
```

### Supabase Real-time

Location: `/lib/supabase/client.ts`

**Subscriptions:**
```typescript
// Token price updates
subscribeToToken(tokenMint: string, callback)

// New trades
subscribeToTrades(tokenMint: string, callback)

// New tokens launched
subscribeToNewTokens(callback)

// Stream status changes
subscribeToStreamStatus(tokenMint: string, callback)

// User portfolio updates
subscribeToUserHoldings(walletAddress: string, callback)
```

---

## Deployment Guide

### Prerequisites

1. **Solana CLI**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
solana-keygen new
```

2. **Anchor**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
```

3. **Node.js 18+**
```bash
nvm install 18
nvm use 18
```

### Deployment Steps

**1. Deploy Smart Contract**
```bash
cd programs/zeroglaze
anchor build
anchor deploy --provider.cluster devnet

# Copy program ID
solana address -k target/deploy/zeroglaze-keypair.json

# Update Anchor.toml and lib.rs with program ID
anchor idl init <PROGRAM_ID> -f target/idl/zeroglaze.json
```

**2. Initialize Platform**
```bash
# Create platform fee wallet
solana-keygen new -o platform-fee-wallet.json

# Call initialize_platform instruction
anchor run initialize
```

**3. Setup Supabase**
```bash
# Create Supabase project at https://supabase.com

# Run migration
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql

# Setup RLS policies (already in migration)
```

**4. Configure Environment**
```bash
cp .env.example .env
# Fill in all values from Supabase, Twitch, Solana
```

**5. Deploy Next.js App**
```bash
npm install
npm run build

# Deploy to Vercel
vercel --prod

# Or self-host
npm run start
```

**6. Setup Cron Jobs**
```bash
# Vercel cron for 24h metrics
# Add to vercel.json:
{
  "crons": [{
    "path": "/api/cron/update-metrics",
    "schedule": "0 * * * *"
  }]
}
```

**7. Setup Twitch Webhooks**
- Configure callback URL in Twitch Developer Console
- Ensure HTTPS enabled
- Test webhook endpoint

---

## Security Considerations

### Smart Contract Security

**1. Access Control**
- Platform authority required for critical operations
- Creator ownership verified for fee withdrawals
- PDA seeds prevent address collision

**2. Math Safety**
- All calculations use checked arithmetic
- Overflow protection via `checked_mul`, `checked_add`
- Fee calculations validated

**3. Reentrancy Protection**
- No external calls before state updates
- SOL transfers done last
- PDA ownership prevents unauthorized access

**4. Input Validation**
- String length limits enforced
- Token amounts validated
- Slippage protection on trades

### API Security

**1. Rate Limiting**
```typescript
// Per wallet/IP
checkRateLimit(identifier, maxRequests: 100, windowMs: 60000)
```

**2. Input Sanitization**
- All inputs validated via Zod schemas
- SQL injection prevented (Supabase client)
- XSS protection on string inputs

**3. Authentication**
- Webhook signature verification
- Optional JWT for sensitive endpoints
- RLS policies on database

**4. Error Handling**
- Never expose internal errors
- Log all errors server-side
- Return generic messages to client

### Best Practices

**1. Secrets Management**
- Never commit `.env` files
- Use Vercel environment variables
- Rotate secrets regularly
- Store keypairs securely (AWS Secrets Manager, etc.)

**2. Monitoring**
- Setup Sentry for error tracking
- Monitor RPC rate limits
- Alert on failed transactions
- Track platform metrics

**3. Testing**
- Unit tests for bonding curve math
- Integration tests for API endpoints
- Devnet testing before mainnet
- Audit smart contracts before launch

**4. Disaster Recovery**
- Database backups (Supabase automatic)
- Program upgrade authority management
- Emergency pause mechanism (future)

---

## Performance Optimization

### Database
- Indexed queries on common patterns
- Materialized views for heavy aggregations
- Connection pooling
- Query result caching (Redis optional)

### Blockchain
- Batch RPC calls where possible
- Connection pooling
- Retry logic with exponential backoff
- Use Helius/QuickNode for reliability

### API
- Edge caching for public endpoints
- Real-time subscriptions instead of polling
- Pagination on list endpoints
- gzip compression

---

## Monitoring Checklist

- [ ] RPC endpoint health
- [ ] Database query performance
- [ ] API response times
- [ ] Error rates
- [ ] Transaction success rates
- [ ] Platform fee collection
- [ ] Stream status update frequency
- [ ] Webhook delivery success

---

## Future Enhancements

1. **Liquidity Pool Migration** (Graduation)
   - Raydium LP creation
   - LP token burning
   - Creator token unlock

2. **Advanced Features**
   - Token comments/chat
   - Price alerts
   - Limit orders
   - Creator token vesting schedules

3. **Analytics**
   - Creator dashboards
   - Trading analytics
   - Portfolio tracking
   - Leaderboards

4. **Scaling**
   - Read replicas for database
   - Redis caching layer
   - WebSocket clustering
   - CDN for static assets

---

## Support & Resources

- **Anchor Docs**: https://www.anchor-lang.com/
- **Solana Docs**: https://docs.solana.com/
- **Supabase Docs**: https://supabase.com/docs
- **Twitch API**: https://dev.twitch.tv/docs/api/

---

**Last Updated**: December 26, 2024
**Version**: 1.0.0
**Status**: Production Ready
