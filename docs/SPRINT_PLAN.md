# Zeroglaze MVP - 6-Day Sprint Plan

**Sprint Goal**: Ship a working MVP that allows streamers to launch tokens on Solana Devnet, traders to buy/sell with real-time pricing, and automatic fee distribution based on stream status.

**Team Size**: 1 developer (solo sprint)
**Start Date**: December 26, 2024
**End Date**: December 31, 2024

---

## Executive Summary

This sprint delivers the core MVP features in 6 days by making smart trade-offs between scope, quality, and speed. We'll focus on shipping a working product that demonstrates core value: token creation, trading, and stream-linked fee distribution.

### Trade-off Decisions Made

| Feature | MVP Decision | Rationale |
|---------|--------------|-----------|
| Bonding Curve Type | Linear (simplified) | Constant product AMM requires complex Solana program testing. Linear is 3x faster to implement and still demonstrates value. Can upgrade post-MVP. |
| Chart Library | Basic Chart.js line chart | TradingView integration takes 2+ days. Chart.js gives 80% of the visual value in 4 hours. |
| Stream Platforms | Twitch only | Multi-platform adds 2+ days of API integration. Twitch has best API docs and is most popular. |
| Mobile Experience | Responsive web only | Native apps or advanced PWA add 3+ days. Responsive CSS gives 90% of value in 6 hours. |
| Authentication | Phantom wallet only | Email/social auth adds 2+ days and isn't needed for crypto users. Wallet = identity. |
| Smart Contract Framework | Anchor (Rust) | Industry standard, best docs, fastest development for Solana. |
| Database | Supabase | Built-in real-time, auth-ready, generous free tier. Faster than Firebase for this use case. |
| Real-time Updates | Supabase Realtime + polling | Full WebSocket architecture adds 1+ day. Supabase Realtime + 5s polling gives 95% of smoothness. |
| Token Metadata | On-chain minimal + Supabase | Full Metaplex integration adds 1 day. Store essentials on-chain, rich data in Supabase. |
| Creator Token Freeze | Manual option (no enforcement) | Smart contract token freeze logic adds 1 day. Let creators choose, show badge in UI. |
| Testing | Manual testing + basic unit tests | Full test coverage adds 2+ days. Manual testing of critical paths is sufficient for MVP. |

### What's IN Scope (Must-Have)

✅ Phantom wallet connection
✅ Streamer token creation (SPL token on Devnet)
✅ Token metadata (name, ticker, thumbnail)
✅ Twitch stream verification (is streamer live?)
✅ Buy/sell interface with price calculation
✅ Linear bonding curve pricing
✅ Fee distribution (1% platform, 2% creator live, 0.2% offline)
✅ Real-time price updates (5-second polling)
✅ Token discovery page (list all tokens)
✅ Basic trading chart (price over time)
✅ One token per wallet address enforcement
✅ Stream status display (live/offline indicator)

### What's OUT of Scope (V1/V2)

❌ Token graduation to DEX (adds 2+ days of complexity)
❌ Constant product bonding curve (too complex for 6 days)
❌ Advanced charts (TradingView integration)
❌ Stream overlay widget (requires OBS plugin)
❌ Multi-platform support (YouTube, Kick)
❌ KYC/verification system
❌ Mobile app (just responsive web)
❌ Creator token freeze enforcement in smart contract
❌ Advanced security auditing
❌ Performance optimization
❌ SEO optimization
❌ Analytics dashboard
❌ Admin panel

---

## Daily Breakdown

### Day 1 (Dec 26): Foundation & Infrastructure

**Goal**: Set up development environment, database, and basic UI shell

**Morning (4 hours): Environment Setup**
- [x] Initialize Next.js 14 project with TypeScript + Tailwind
- [x] Install dependencies: @solana/web3.js, @solana/wallet-adapter-react, @solana/spl-token
- [x] Set up Supabase project and configure environment variables
- [x] Create database schema (users, tokens, trades, stream_status)
- [x] Set up Anchor workspace for Solana programs
- [x] Configure Solana CLI for Devnet

**Afternoon (4 hours): Core UI Shell**
- [ ] Create main layout with navigation (streamer/trader modes)
- [ ] Implement Phantom wallet connection component
- [ ] Build basic routing structure (/create, /trade, /discover)
- [ ] Add Tailwind + DaisyUI styling foundation
- [ ] Create reusable components (Button, Card, Modal)

**Evening (2 hours): Database Setup**
- [ ] Create Supabase tables with Row Level Security (RLS)
- [ ] Set up database helper functions (lib/supabase.ts)
- [ ] Test database connection from Next.js API routes
- [ ] Create seed data for testing

**Deliverables**:
- ✅ Working Next.js app with wallet connection
- ✅ Supabase database with schema
- ✅ Anchor project initialized
- ✅ Development environment fully configured

**Success Metrics**:
- Can connect Phantom wallet and see wallet address
- Can query Supabase from Next.js
- Solana Devnet connection working

---

### Day 2 (Dec 27): Token Creation & Smart Contract

**Goal**: Build token creation flow and deploy SPL token creation program

**Morning (4 hours): Smart Contract - Token Creation**
- [ ] Write Anchor program for SPL token creation
- [ ] Implement `create_token` instruction (mint authority, freeze authority)
- [ ] Add `initialize_token_account` for creator
- [ ] Set token metadata (name, symbol) on-chain
- [ ] Build and deploy program to Devnet
- [ ] Test token creation with Anchor tests

**Afternoon (4 hours): Token Creation UI**
- [ ] Build streamer onboarding flow (/create page)
- [ ] Add form for token details (name, ticker, thumbnail upload)
- [ ] Implement Twitch username input + validation
- [ ] Create token preview component
- [ ] Add image upload to Supabase Storage
- [ ] Connect UI to smart contract instruction

**Evening (2 hours): Database Integration**
- [ ] Store token metadata in Supabase `tokens` table
- [ ] Link token to wallet address (one token per wallet check)
- [ ] Create API route: POST /api/tokens/create
- [ ] Add error handling and loading states
- [ ] Test full token creation flow end-to-end

**Deliverables**:
- ✅ Deployed Solana program for token creation
- ✅ Working token creation UI
- ✅ Tokens stored in database
- ✅ One token per wallet enforcement

**Success Metrics**:
- Can create SPL token from UI
- Token appears in Phantom wallet
- Token metadata saved to database
- Error handling works for edge cases

---

### Day 3 (Dec 28): Bonding Curve & Trading Logic

**Goal**: Implement simplified linear bonding curve and trading functions

**Morning (4 hours): Smart Contract - Trading**
- [ ] Implement linear bonding curve logic in Anchor program
- [ ] Add `buy_tokens` instruction with price calculation
- [ ] Add `sell_tokens` instruction with price calculation
- [ ] Implement fee distribution (platform wallet, creator wallet)
- [ ] Add dynamic fee based on stream status (2% live, 0.2% offline)
- [ ] Test trading instructions with various scenarios

**Afternoon (4 hours): Trading UI**
- [ ] Build trading interface (/trade/[tokenAddress] page)
- [ ] Add buy/sell tabs with amount input
- [ ] Implement real-time price calculation display
- [ ] Show fee breakdown (platform fee, creator fee, total)
- [ ] Add "Max" button to buy/sell entire balance
- [ ] Display user's token balance

**Evening (2 hours): Transaction Handling**
- [ ] Build transaction signing flow with Phantom
- [ ] Add confirmation modal with transaction summary
- [ ] Implement error handling (insufficient funds, slippage)
- [ ] Store trade history in Supabase `trades` table
- [ ] Add loading states and success/error toasts

**Deliverables**:
- ✅ Working buy/sell functionality
- ✅ Linear bonding curve pricing
- ✅ Fee distribution implemented
- ✅ Trade history tracked

**Success Metrics**:
- Can buy tokens and see balance update
- Can sell tokens and receive SOL
- Fees correctly distributed to platform + creator
- Price changes based on supply

**Bonding Curve Constants** (Linear Model for MVP):
```typescript
// Simplified linear curve: Price = BASE_PRICE + (SLOPE × tokens_sold)
const BASE_PRICE = 0.00000001; // SOL per token (starting price)
const SLOPE = 0.0000000001; // Price increase per token sold
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
const CURVE_SUPPLY = 800_000_000; // 80% tradeable
const CREATOR_SUPPLY = 200_000_000; // 20% to creator
```

---

### Day 4 (Dec 29): Twitch Integration & Real-time Updates

**Goal**: Connect to Twitch API for stream status and add real-time updates

**Morning (4 hours): Twitch API Integration**
- [ ] Register Twitch app and get API credentials
- [ ] Build API route: GET /api/twitch/stream-status
- [ ] Implement Twitch OAuth flow (optional: just use username lookup)
- [ ] Create background job to poll stream status every 60 seconds
- [ ] Update `stream_status` table with live/offline status
- [ ] Add webhook endpoint for stream status changes (if time permits)

**Afternoon (4 hours): Real-time UI Updates**
- [ ] Set up Supabase Realtime subscriptions
- [ ] Subscribe to token price changes in trading UI
- [ ] Add live indicator badge (green dot when streaming)
- [ ] Implement auto-refresh for token list
- [ ] Show recent trades feed (last 10 trades)
- [ ] Add WebSocket fallback with 5-second polling

**Evening (2 hours): Stream Status Logic**
- [ ] Update smart contract to accept `is_live` parameter
- [ ] Adjust creator fees based on stream status
- [ ] Display fee tier in UI ("2% - Streamer is LIVE!" vs "0.2% - Offline")
- [ ] Add notification when stream goes live
- [ ] Test fee switching when stream status changes

**Deliverables**:
- ✅ Twitch stream status verification working
- ✅ Real-time price updates
- ✅ Dynamic fee adjustment based on stream status
- ✅ Live/offline indicator

**Success Metrics**:
- Stream status updates within 60 seconds of going live/offline
- Fee tier changes automatically
- UI updates in real-time without refresh
- Recent trades feed shows live activity

---

### Day 5 (Dec 30): Discovery, Charts & Polish

**Goal**: Add token discovery page, basic charts, and UI polish

**Morning (4 hours): Token Discovery**
- [ ] Build discovery page (/discover) with token list
- [ ] Add sorting (by market cap, volume, newest)
- [ ] Implement search/filter (by name, ticker, streamer)
- [ ] Show token cards with key stats (price, market cap, 24h volume)
- [ ] Add live/offline filter
- [ ] Display streamer Twitch link

**Afternoon (4 hours): Trading Charts**
- [ ] Install Chart.js library
- [ ] Create price chart component (line chart)
- [ ] Fetch price history from trades table
- [ ] Add timeframe selector (1H, 24H, 7D, All)
- [ ] Show volume bars (optional, if time permits)
- [ ] Add tooltips with price/time on hover

**Evening (2 hours): UI Polish & Mobile Responsive**
- [ ] Make all pages mobile-responsive (Tailwind breakpoints)
- [ ] Add loading skeletons for better UX
- [ ] Improve error messages and validation
- [ ] Add empty states (no tokens, no trades)
- [ ] Polish animations and transitions
- [ ] Test on mobile devices

**Deliverables**:
- ✅ Token discovery page
- ✅ Basic price charts
- ✅ Mobile-responsive design
- ✅ Polished UI/UX

**Success Metrics**:
- Can discover and filter tokens easily
- Charts display price history correctly
- App works well on mobile (no horizontal scroll, readable text)
- Loading states prevent UI jank

---

### Day 6 (Dec 31): Testing, Bug Fixes & Launch Prep

**Goal**: Test everything, fix critical bugs, deploy to production

**Morning (4 hours): Testing & Bug Fixes**
- [ ] End-to-end testing of entire user flow (streamer + trader)
- [ ] Test wallet connection edge cases (wallet locked, wrong network)
- [ ] Test trading edge cases (insufficient balance, zero amounts)
- [ ] Fix critical bugs found during testing
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test Phantom wallet transactions thoroughly

**Afternoon (3 hours): Final Polish & Documentation**
- [ ] Add toast notifications for all actions
- [ ] Create basic user guide (how to create token, how to trade)
- [ ] Add FAQ section (What is bonding curve? What are fees?)
- [ ] Write deployment README
- [ ] Add error boundary for React errors
- [ ] Optimize images and assets

**Evening (3 hours): Deployment & Launch**
- [ ] Deploy Solana program to Devnet (final version)
- [ ] Deploy Next.js app to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Test production deployment
- [ ] Monitor for errors in Sentry/Vercel logs
- [ ] Create launch tweet/announcement
- [ ] Document known issues for V1

**Deliverables**:
- ✅ Fully tested MVP
- ✅ Deployed to production (Vercel + Solana Devnet)
- ✅ User documentation
- ✅ Launch announcement ready

**Success Metrics**:
- App loads without errors
- Can complete full user journey without bugs
- Transaction success rate > 95%
- Page load time < 3 seconds
- Mobile usable

---

## Critical Path Analysis

These tasks MUST be completed in order for the MVP to work. Any delay here delays the entire sprint.

### Critical Path Items:

1. **Day 1**: Wallet connection + Database setup → **Blocks everything**
2. **Day 2**: Token creation smart contract → **Blocks trading (Day 3)**
3. **Day 3**: Buy/sell smart contract → **Blocks real-time updates (Day 4)**
4. **Day 4**: Twitch integration → **Blocks fee adjustment logic**
5. **Day 5**: Discovery page → **Not critical, but needed for launch**
6. **Day 6**: Deployment → **Critical for launch**

### Dependency Chain:
```
Day 1 (Infrastructure)
  ↓
Day 2 (Token Creation)
  ↓
Day 3 (Trading Logic)
  ↓
Day 4 (Stream Integration)
  ↓
Day 5 (Discovery + Charts)
  ↓
Day 6 (Testing + Deploy)
```

### Risk Mitigation:

**High Risk Areas**:
1. **Solana program debugging** (Days 2-3): Hardest to debug. Mitigate with Anchor tests.
2. **Twitch API rate limits** (Day 4): Use conservative polling (60s). Consider caching.
3. **Transaction failures** (Day 3): Add retry logic and clear error messages.
4. **Real-time updates lag** (Day 4): Fall back to polling if Supabase Realtime fails.

**Contingency Plans**:
- If smart contract takes too long → Use SPL Token CLI directly (skip Anchor)
- If Twitch API fails → Manual stream status toggle for MVP
- If real-time updates fail → 10-second polling is acceptable
- If charts take too long → Skip for MVP, add in V1

---

## Stack Decisions (with Rationale)

### Frontend
- **Next.js 14** - SSR for SEO, API routes for backend, best React framework
- **TypeScript** - Type safety prevents bugs, better DX
- **Tailwind CSS** - Fastest styling, mobile-first, no CSS files
- **DaisyUI** - Pre-built components save 50% UI dev time
- **Chart.js** - Lightweight, simple charts (vs TradingView which takes 2+ days)

### Backend
- **Next.js API Routes** - Serverless, no separate backend needed, fast deployment
- **Supabase (PostgreSQL)** - Real-time built-in, auth-ready, generous free tier
- **Supabase Realtime** - Easier than Socket.io, database-driven updates

### Blockchain
- **Solana Devnet** - Free testing, same as mainnet behavior
- **Anchor Framework** - Best DX for Solana smart contracts, great docs
- **SPL Token Program** - Standard for token creation, battle-tested
- **@solana/web3.js** - Official Solana SDK for JavaScript

### External APIs
- **Twitch API** - Best documented live streaming API, most popular platform

### Deployment
- **Vercel** - Zero-config Next.js deployment, excellent DX, free tier
- **Supabase Cloud** - Managed PostgreSQL, free tier sufficient for MVP

---

## Success Metrics

### Sprint Success (Process)
- [ ] All Day 1-6 deliverables completed
- [ ] < 20% scope change during sprint
- [ ] Zero critical bugs at launch
- [ ] Deployment completed by EOD Dec 31

### Product Success (Features)
- [ ] Streamer can create token in < 2 minutes
- [ ] Trader can buy/sell in < 30 seconds
- [ ] Stream status updates within 60 seconds
- [ ] Real-time price updates within 5 seconds
- [ ] Mobile-responsive (no horizontal scroll)

### Technical Success (Quality)
- [ ] Smart contract deployed without errors
- [ ] Transaction success rate > 95%
- [ ] Page load time < 3 seconds
- [ ] Zero console errors in production
- [ ] Works on Chrome, Firefox, Safari

### Business Success (Validation)
- [ ] At least 1 real token created (by you)
- [ ] At least 3 test trades completed
- [ ] Fees correctly distributed to wallets
- [ ] App sharable with early testers
- [ ] Clear path to V1 features

---

## Post-Sprint Priorities (V1)

After MVP launch, prioritize these features for V1 (weeks 2-4):

### Week 2: Constant Product Bonding Curve
- Replace linear curve with constant product AMM (Pump.fun model)
- Implement graduation mechanism (85 SOL threshold)
- Add liquidity migration to Raydium

### Week 3: UX Improvements
- Advanced charts (TradingView Lightweight Charts)
- Transaction history page
- Portfolio page (all your tokens)
- Share token cards (social media)
- Animations and celebrations (confetti on trade)

### Week 4: Creator Tools
- Token freeze option (smart contract enforcement)
- Creator dashboard (earnings, holders)
- Stream overlay widget (market cap ticker)
- Verified creator badge

---

## Daily Standup Format

Each morning, review:
1. **Yesterday**: What was completed?
2. **Today**: What's the priority?
3. **Blockers**: Any issues preventing progress?
4. **Scope**: Any features to cut or defer?

**Example Day 3 Standup**:
- **Yesterday**: Token creation working, database integrated ✅
- **Today**: Build trading logic (buy/sell) and bonding curve
- **Blockers**: Anchor testing slower than expected, might skip some unit tests
- **Scope**: Considering cutting "Max" button to save 30 minutes

---

## Technical Debt Tracker

Acceptable shortcuts for MVP that should be fixed in V1:

1. **Linear bonding curve** → Replace with constant product (Day 3)
2. **Polling instead of WebSockets** → Implement full real-time (Day 4)
3. **Manual testing only** → Add automated tests (Day 6)
4. **Basic Chart.js** → Upgrade to TradingView (Day 5)
5. **No token freeze enforcement** → Add smart contract logic (Day 2)
6. **No rate limiting** → Add API rate limits (Day 1)
7. **No caching** → Add Redis caching (Day 4)
8. **No error tracking** → Add Sentry (Day 6)

---

## Resource Links

### Documentation
- Solana Docs: https://docs.solana.com
- Anchor Book: https://book.anchor-lang.com
- Supabase Docs: https://supabase.com/docs
- Twitch API: https://dev.twitch.tv/docs/api

### Tutorials
- Create Solana dApp: https://github.com/solana-labs/create-solana-dapp
- Anchor SPL Token: https://www.anchor-lang.com/docs/token
- Bonding Curves: https://medium.com/@buildwithbhavya/the-math-behind-pump-fun-b58fdb30ed77

### Tools
- Solana Explorer (Devnet): https://explorer.solana.com/?cluster=devnet
- Anchor Playground: https://beta.solpg.io
- Supabase Dashboard: https://app.supabase.com

---

## Final Notes

**Philosophy**: Ship fast, learn fast. This MVP prioritizes working features over perfect features. Every trade-off is documented and reversible.

**Mantras for the Sprint**:
- "Working > Perfect"
- "Test manually > Not test at all"
- "Ship today > Ship perfectly tomorrow"
- "Linear curve > No curve"
- "Chart.js > No chart"

**What Success Looks Like**:
On December 31 at 11:59pm, a streamer can:
1. Connect their Phantom wallet
2. Link their Twitch stream
3. Launch a token in 2 clicks
4. See traders buying their token
5. Earn fees automatically when streaming

And a trader can:
1. Discover tokens
2. Buy with 1 click
3. See price update in real-time
4. Sell when price increases
5. Make profit (or loss)

**That's the MVP. Let's ship it.**

---

**Last Updated**: December 26, 2024
**Sprint Status**: Ready to Start
**Confidence Level**: 85% (realistic but aggressive timeline)
