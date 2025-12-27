# Zeroglaze 6-Day Sprint - Daily Execution Checklist

**Track your progress each day and stay on schedule.**

---

## Day 1: Foundation & Infrastructure (Dec 26)

### Morning: Environment Setup (4 hours)

- [ ] **Initialize Next.js Project**
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app
  ```
  - [ ] Verify app runs on localhost:3000
  - [ ] Remove default boilerplate

- [ ] **Install Core Dependencies**
  ```bash
  npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/spl-token @supabase/supabase-js daisyui
  ```
  - [ ] Add daisyui to tailwind.config.js
  - [ ] Test imports work

- [ ] **Initialize Anchor Project**
  ```bash
  anchor init programs
  cd programs
  anchor build
  ```
  - [ ] Verify Cargo.toml exists
  - [ ] Update Anchor.toml for devnet

- [ ] **Set Up Supabase**
  - [ ] Create new project at supabase.com
  - [ ] Copy URL and anon key to .env.local
  - [ ] Run database schema SQL (from TECHNICAL_IMPLEMENTATION.md)
  - [ ] Verify tables created in Supabase dashboard

- [ ] **Configure Solana CLI**
  ```bash
  solana config set --url devnet
  solana-keygen new # Create keypair
  solana airdrop 2  # Get test SOL
  ```
  - [ ] Verify balance: `solana balance`

**Checkpoint**: Can run Next.js app, have Supabase tables, and Solana CLI works.

---

### Afternoon: Core UI Shell (4 hours)

- [ ] **Create Layout Structure**
  - [ ] Update `app/layout.tsx` with providers
  - [ ] Add wallet adapter provider
  - [ ] Add basic navigation (Home, Create, Trade, Discover)

- [ ] **Build Wallet Connection**
  - [ ] Create `components/wallet/WalletButton.tsx`
  - [ ] Test Phantom wallet connection
  - [ ] Display wallet address when connected

- [ ] **Set Up Routing**
  - [ ] Create `app/create/page.tsx` (empty for now)
  - [ ] Create `app/trade/[address]/page.tsx` (empty for now)
  - [ ] Create `app/discover/page.tsx` (empty for now)
  - [ ] Verify routing works

- [ ] **Create Reusable Components**
  - [ ] `components/ui/Button.tsx`
  - [ ] `components/ui/Card.tsx`
  - [ ] `components/ui/Modal.tsx`
  - [ ] Add Tailwind/DaisyUI styling

**Checkpoint**: Can navigate between pages and connect Phantom wallet.

---

### Evening: Database Setup (2 hours)

- [ ] **Create Database Helper**
  - [ ] Create `lib/supabase.ts` with client
  - [ ] Test connection with simple query

- [ ] **Set Up API Routes**
  - [ ] Create `app/api/tokens/create/route.ts` (stub)
  - [ ] Create `app/api/tokens/list/route.ts` (stub)
  - [ ] Test API routes return 200

- [ ] **Create Seed Data** (optional)
  - [ ] Insert 1-2 test tokens manually in Supabase
  - [ ] Verify can query from Next.js

**End of Day 1 Deliverables**:
- ✅ Working Next.js app with wallet connection
- ✅ Supabase database with schema
- ✅ Anchor project initialized
- ✅ Development environment configured

**Time Check**: Did you finish in 10 hours? If not, what took longer than expected?

---

## Day 2: Token Creation & Smart Contract (Dec 27)

### Morning: Smart Contract (4 hours)

- [ ] **Write Anchor Program Structure**
  - [ ] Create `programs/zeroglaze/src/lib.rs`
  - [ ] Add `initialize` instruction
  - [ ] Add `create_token` instruction
  - [ ] Define account structures (Platform, TokenData)

- [ ] **Implement Token Creation Logic**
  - [ ] Set up SPL token mint
  - [ ] Mint creator tokens (200M)
  - [ ] Store token metadata in TokenData account

- [ ] **Build and Deploy**
  ```bash
  anchor build
  anchor deploy --provider.cluster devnet
  ```
  - [ ] Copy Program ID
  - [ ] Update `lib.rs` with declare_id!()

- [ ] **Write Anchor Tests**
  ```bash
  anchor test
  ```
  - [ ] Test `initialize` instruction
  - [ ] Test `create_token` instruction
  - [ ] Verify tokens minted correctly

**Checkpoint**: Smart contract deployed and tested on Devnet.

---

### Afternoon: Token Creation UI (4 hours)

- [ ] **Build Create Token Page**
  - [ ] Create form in `app/create/page.tsx`
  - [ ] Add inputs: name, ticker, thumbnail, Twitch username
  - [ ] Add form validation

- [ ] **Implement Image Upload**
  - [ ] Set up Supabase Storage bucket
  - [ ] Add image upload function
  - [ ] Display image preview

- [ ] **Connect to Smart Contract**
  - [ ] Create `lib/solana.ts` with helper functions
  - [ ] Build transaction to call `create_token`
  - [ ] Sign transaction with Phantom wallet
  - [ ] Wait for confirmation

- [ ] **Add Loading States**
  - [ ] Show spinner while transaction pending
  - [ ] Show success/error toasts
  - [ ] Redirect to token page on success

**Checkpoint**: Can create token from UI, transaction succeeds on Devnet.

---

### Evening: Database Integration (2 hours)

- [ ] **Implement API Route**
  - [ ] Complete `app/api/tokens/create/route.ts`
  - [ ] Validate wallet doesn't already have token
  - [ ] Insert token into database
  - [ ] Return token data

- [ ] **Connect Frontend to API**
  - [ ] Call API after successful transaction
  - [ ] Handle errors (wallet already has token)
  - [ ] Update UI state

- [ ] **End-to-End Test**
  - [ ] Create token from UI
  - [ ] Verify token in Phantom wallet
  - [ ] Verify token in Supabase database
  - [ ] Verify token appears on Solana Explorer

**End of Day 2 Deliverables**:
- ✅ Deployed Solana program for token creation
- ✅ Working token creation UI
- ✅ Tokens stored in database
- ✅ One token per wallet enforcement

**Time Check**: On schedule? If behind, consider cutting image upload for now.

---

## Day 3: Bonding Curve & Trading Logic (Dec 28)

### Morning: Smart Contract Trading (4 hours)

- [ ] **Implement Bonding Curve Math**
  - [ ] Add `calculate_buy_cost` function (linear curve)
  - [ ] Add `calculate_sell_proceeds` function
  - [ ] Test math in Rust unit tests

- [ ] **Add Buy Tokens Instruction**
  - [ ] Create `BuyTokens` account structure
  - [ ] Transfer SOL from buyer
  - [ ] Distribute fees (platform + creator)
  - [ ] Mint tokens to buyer
  - [ ] Update tokens_sold counter

- [ ] **Add Sell Tokens Instruction**
  - [ ] Create `SellTokens` account structure
  - [ ] Burn seller's tokens
  - [ ] Calculate SOL proceeds
  - [ ] Distribute fees
  - [ ] Transfer SOL to seller

- [ ] **Deploy Updated Program**
  ```bash
  anchor build
  anchor upgrade --provider.cluster devnet --program-id <ID>
  ```
  - [ ] Test buy instruction
  - [ ] Test sell instruction

**Checkpoint**: Can buy and sell tokens via smart contract.

---

### Afternoon: Trading UI (4 hours)

- [ ] **Create Trading Page**
  - [ ] Build `app/trade/[address]/page.tsx`
  - [ ] Fetch token data from database
  - [ ] Display token info (name, ticker, price, market cap)

- [ ] **Build Buy Panel**
  - [ ] Create `components/trading/BuyPanel.tsx`
  - [ ] Add amount input
  - [ ] Calculate and display cost breakdown
  - [ ] Add "Buy" button

- [ ] **Build Sell Panel**
  - [ ] Create `components/trading/SellPanel.tsx`
  - [ ] Add amount input
  - [ ] Display user's token balance
  - [ ] Calculate and display proceeds breakdown
  - [ ] Add "Sell" button

- [ ] **Implement Bonding Curve Logic**
  - [ ] Create `lib/bonding-curve.ts`
  - [ ] Implement `calculateBuyCost()`
  - [ ] Implement `calculateSellProceeds()`
  - [ ] Test calculations match smart contract

**Checkpoint**: Trading UI displays correct prices and fees.

---

### Evening: Transaction Handling (2 hours)

- [ ] **Build Buy Transaction**
  - [ ] Create transaction in `lib/solana.ts`
  - [ ] Call `buy_tokens` instruction
  - [ ] Sign with Phantom wallet
  - [ ] Wait for confirmation

- [ ] **Build Sell Transaction**
  - [ ] Create transaction in `lib/solana.ts`
  - [ ] Call `sell_tokens` instruction
  - [ ] Sign with Phantom wallet
  - [ ] Wait for confirmation

- [ ] **Store Trade History**
  - [ ] Insert trade into `trades` table after confirmation
  - [ ] Update token's `tokens_sold` and `current_price`

- [ ] **Test Full Trading Flow**
  - [ ] Buy tokens
  - [ ] See balance update in wallet
  - [ ] See price increase
  - [ ] Sell tokens
  - [ ] Receive SOL

**End of Day 3 Deliverables**:
- ✅ Working buy/sell functionality
- ✅ Linear bonding curve pricing
- ✅ Fee distribution implemented
- ✅ Trade history tracked

**Time Check**: If behind, skip storing trade history for now (can add later).

---

## Day 4: Twitch Integration & Real-time Updates (Dec 29)

### Morning: Twitch API (4 hours)

- [ ] **Register Twitch App**
  - [ ] Go to dev.twitch.tv
  - [ ] Create new app
  - [ ] Get Client ID and Secret
  - [ ] Add to .env.local

- [ ] **Build API Route**
  - [ ] Create `app/api/twitch/stream-status/route.ts`
  - [ ] Implement OAuth token fetch
  - [ ] Implement stream status check
  - [ ] Test with real Twitch username

- [ ] **Create Background Job** (simple version)
  - [ ] Create `lib/twitch.ts` with polling function
  - [ ] Poll every 60 seconds for all tokens
  - [ ] Update `is_live` in database
  - [ ] Log status changes

- [ ] **Test Stream Detection**
  - [ ] Start a Twitch stream
  - [ ] Verify API detects live status
  - [ ] Stop stream
  - [ ] Verify API detects offline status

**Checkpoint**: Can detect Twitch stream status accurately.

---

### Afternoon: Real-time Updates (4 hours)

- [ ] **Set Up Supabase Realtime**
  - [ ] Enable realtime on `tokens` and `trades` tables
  - [ ] Test subscription in Supabase dashboard

- [ ] **Create Realtime Hooks**
  - [ ] Create `hooks/useRealtime.ts`
  - [ ] Implement `useTokenRealtime(address)`
  - [ ] Implement `useTradesRealtime(address)`

- [ ] **Update Trading Page**
  - [ ] Subscribe to token updates
  - [ ] Auto-update price when trades happen
  - [ ] Show recent trades feed (last 10)

- [ ] **Add Live Indicator**
  - [ ] Create live/offline badge component
  - [ ] Subscribe to `is_live` changes
  - [ ] Update badge in real-time

**Checkpoint**: Price updates automatically when other users trade.

---

### Evening: Stream Status Logic (2 hours)

- [ ] **Update Smart Contract** (if time permits)
  - [ ] Accept `is_live` parameter in buy/sell
  - [ ] OR query database from frontend before transaction

- [ ] **Adjust Fees Based on Status**
  - [ ] Show "2% - LIVE!" when streaming
  - [ ] Show "0.2% - Offline" when not streaming
  - [ ] Update fee calculation in UI

- [ ] **Test Fee Switching**
  - [ ] Create token
  - [ ] Trade while offline (0.2% creator fee)
  - [ ] Start stream
  - [ ] Trade while live (2% creator fee)
  - [ ] Verify correct fees charged

**End of Day 4 Deliverables**:
- ✅ Twitch stream status verification working
- ✅ Real-time price updates
- ✅ Dynamic fee adjustment based on stream status
- ✅ Live/offline indicator

**Time Check**: If behind, use manual stream status toggle instead of API.

---

## Day 5: Discovery, Charts & Polish (Dec 30)

### Morning: Token Discovery (4 hours)

- [ ] **Build Discovery Page**
  - [ ] Create `app/discover/page.tsx`
  - [ ] Fetch all tokens from database
  - [ ] Display in grid layout

- [ ] **Create Token Card Component**
  - [ ] Create `components/tokens/TokenCard.tsx`
  - [ ] Show thumbnail, name, ticker
  - [ ] Show current price, market cap
  - [ ] Show live/offline status
  - [ ] Add link to trading page

- [ ] **Add Sorting**
  - [ ] Sort by market cap (default)
  - [ ] Sort by newest
  - [ ] Sort by 24h volume

- [ ] **Add Filtering**
  - [ ] Filter by live/offline
  - [ ] Search by name or ticker
  - [ ] Search by streamer username

**Checkpoint**: Can discover and browse all tokens easily.

---

### Afternoon: Trading Charts (4 hours)

- [ ] **Install Chart.js**
  ```bash
  npm install chart.js react-chartjs-2
  ```

- [ ] **Create Price Chart Component**
  - [ ] Create `components/trading/PriceChart.tsx`
  - [ ] Fetch trade history from database
  - [ ] Convert to chart data format
  - [ ] Render line chart

- [ ] **Add Timeframe Selector**
  - [ ] Add buttons: 1H, 24H, 7D, All
  - [ ] Filter trades by timeframe
  - [ ] Update chart when timeframe changes

- [ ] **Style Chart**
  - [ ] Make responsive
  - [ ] Add tooltips
  - [ ] Add grid lines
  - [ ] Color: green for up, red for down

**Checkpoint**: Charts display price history correctly.

---

### Evening: Mobile Responsive & Polish (2 hours)

- [ ] **Test Mobile Responsiveness**
  - [ ] Open app on mobile device or Chrome DevTools
  - [ ] Check all pages: home, create, trade, discover
  - [ ] Fix horizontal scroll issues
  - [ ] Adjust text sizes for readability

- [ ] **Add Loading Skeletons**
  - [ ] Create skeleton loader components
  - [ ] Show while fetching token data
  - [ ] Show while fetching trades

- [ ] **Improve Error Handling**
  - [ ] Better error messages (not just "Error")
  - [ ] Show specific errors (insufficient balance, etc.)
  - [ ] Add retry buttons

- [ ] **Add Empty States**
  - [ ] "No tokens found" on discovery page
  - [ ] "No trades yet" on trading page
  - [ ] "Connect wallet to continue"

- [ ] **Polish Animations**
  - [ ] Smooth page transitions
  - [ ] Button hover effects
  - [ ] Toast notifications for actions

**End of Day 5 Deliverables**:
- ✅ Token discovery page
- ✅ Basic price charts
- ✅ Mobile-responsive design
- ✅ Polished UI/UX

**Time Check**: If behind, skip charts entirely and launch without them.

---

## Day 6: Testing, Bug Fixes & Launch (Dec 31)

### Morning: Testing (4 hours)

- [ ] **End-to-End Testing**
  - [ ] Test full streamer journey:
    - [ ] Connect wallet
    - [ ] Create token
    - [ ] Verify token appears
    - [ ] Start Twitch stream
    - [ ] Verify live status updates
  - [ ] Test full trader journey:
    - [ ] Discover token
    - [ ] Buy tokens
    - [ ] See price increase
    - [ ] Sell tokens
    - [ ] Verify SOL received

- [ ] **Edge Case Testing**
  - [ ] Wallet not connected
  - [ ] Wallet on wrong network (mainnet vs devnet)
  - [ ] Insufficient SOL balance
  - [ ] Try to create 2nd token (should fail)
  - [ ] Buy 0 tokens (should fail)
  - [ ] Sell more than balance (should fail)

- [ ] **Browser Testing**
  - [ ] Chrome: Test all features
  - [ ] Firefox: Test all features
  - [ ] Safari: Test all features

- [ ] **Fix Critical Bugs**
  - [ ] List bugs found during testing
  - [ ] Fix anything that breaks core flow
  - [ ] Defer minor UI bugs to V1

**Checkpoint**: App works without critical bugs.

---

### Afternoon: Final Polish & Docs (3 hours)

- [ ] **Add Toast Notifications**
  - [ ] "Token created successfully!"
  - [ ] "Purchase successful!"
  - [ ] "Sale successful!"
  - [ ] Error toasts for failures

- [ ] **Create User Guide**
  - [ ] Add "How it Works" section to homepage
  - [ ] Explain bonding curve in simple terms
  - [ ] Explain fee structure
  - [ ] Add FAQ section

- [ ] **Write README**
  - [ ] What is Zeroglaze?
  - [ ] How to use (streamer + trader)
  - [ ] Technical stack
  - [ ] Deployment info

- [ ] **Add Error Boundary**
  - [ ] Create `app/error.tsx`
  - [ ] Catch React errors gracefully
  - [ ] Show friendly error message

**Checkpoint**: App is polished and documented.

---

### Evening: Deployment (3 hours)

- [ ] **Pre-deployment Checks**
  - [ ] All environment variables set
  - [ ] Smart contract deployed to Devnet
  - [ ] Database schema matches code
  - [ ] No console errors in production build

- [ ] **Deploy to Vercel**
  ```bash
  vercel --prod
  ```
  - [ ] Configure environment variables in Vercel dashboard
  - [ ] Wait for deployment to complete
  - [ ] Get production URL

- [ ] **Post-deployment Testing**
  - [ ] Visit production URL
  - [ ] Test wallet connection
  - [ ] Create a real token
  - [ ] Execute a real trade
  - [ ] Verify Twitch integration works
  - [ ] Test on mobile device

- [ ] **Monitor for Errors**
  - [ ] Check Vercel logs
  - [ ] Check Supabase logs
  - [ ] Check Solana Explorer for transactions
  - [ ] Fix any errors found

- [ ] **Launch Announcement**
  - [ ] Share on Twitter
  - [ ] Share in Discord/Telegram
  - [ ] Invite early testers
  - [ ] Document known issues for V1

**End of Day 6 Deliverables**:
- ✅ Fully tested MVP
- ✅ Deployed to production (Vercel + Solana Devnet)
- ✅ User documentation
- ✅ Launch announcement ready

---

## Daily Standup Template

**Copy this each morning:**

```
Date: ___________

Yesterday:
- Completed: ___________
- Struggled with: ___________

Today:
- Priority 1: ___________
- Priority 2: ___________
- Priority 3: ___________

Blockers:
- ___________

Scope Adjustments:
- Cut: ___________
- Added: ___________

Time Estimate:
- Expected hours: ___________
```

---

## Emergency Scope Cuts

**If you're falling behind, cut in this order:**

1. **Day 1**: Seed data, extra UI polish (saves 1-2 hours)
2. **Day 2**: Image upload (saves 1 hour)
3. **Day 3**: Trade history storage (saves 1 hour)
4. **Day 4**: Background polling (use manual toggle) (saves 2 hours)
5. **Day 5**: Charts (saves 4 hours)
6. **Day 6**: Cannot cut - must test and deploy

**Remember**: Shipping a working MVP > Shipping a perfect product.

---

## Success Criteria

By end of Day 6, you should be able to:

- [ ] Connect Phantom wallet
- [ ] Create a token in < 2 minutes
- [ ] Buy tokens in < 30 seconds
- [ ] Sell tokens in < 30 seconds
- [ ] See real-time price updates
- [ ] Detect stream status (live/offline)
- [ ] Browse tokens on discovery page
- [ ] Use app on mobile device

**If you can do all of the above, you've shipped the MVP! 🚀**

---

**Last Updated**: December 26, 2024
**Status**: Ready to execute
