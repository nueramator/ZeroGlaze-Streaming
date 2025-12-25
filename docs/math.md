# Zeroglaze Tokenomics & Mathematical Model

**Purpose**: Define the most profitable bonding curve, fee structure, and economic model for Zeroglaze to maximize platform revenue while keeping traders engaged and streamers earning.

---

## Table of Contents
1. [Core Economic Principles](#core-economic-principles)
2. [Bonding Curve Design](#bonding-curve-design)
3. [Fee Structure](#fee-structure)
4. [Token Distribution](#token-distribution)
5. [Graduation Mechanism](#graduation-mechanism)
6. [Revenue Model](#revenue-model)
7. [Profitability Analysis](#profitability-analysis)
8. [Example Scenarios](#example-scenarios)
9. [Implementation Constants](#implementation-constants)

---

## Core Economic Principles

### Design Goals
1. **Platform Revenue**: Generate sustainable revenue from trading fees
2. **Trader Engagement**: Provide realistic 2-10x return opportunities
3. **Streamer Incentives**: Earn $10-$100 per active streaming session
4. **Price Discovery**: Fair, transparent, and resistant to manipulation
5. **Liquidity**: Maintain tradeable liquidity throughout token lifecycle

### Success Metrics
- **Platform profitability**: Revenue > Costs from day 1
- **Trader satisfaction**: 30%+ of traders achieve profitable exits
- **Streamer retention**: Average earnings > $25/stream session
- **Trading volume**: $10,000+ daily volume at 100 active tokens

---

## Bonding Curve Design

### Selected Model: **Constant Product AMM (Pump.fun Style)**

We use a **virtual constant product formula** similar to Pump.fun, which has proven successful for meme coin launches.

### Mathematical Formula

```
Virtual SOL Reserve × Virtual Token Reserve = K (constant)

Price (in SOL per token) = Virtual SOL Reserve / Virtual Token Reserve
```

### Parameters

```
TOTAL_SUPPLY = 1,000,000,000 tokens (1 billion)
CURVE_SUPPLY = 800,000,000 tokens (80% available for trading)
CREATOR_SUPPLY = 200,000,000 tokens (20% allocated to creator)

VIRTUAL_SOL_RESERVES_INITIAL = 30 SOL
VIRTUAL_TOKEN_RESERVES_INITIAL = 1,073,000,000 tokens

K = VIRTUAL_SOL_RESERVES_INITIAL × VIRTUAL_TOKEN_RESERVES_INITIAL
K = 30 × 1,073,000,000 = 32,190,000,000
```

### Price Calculation

At any point during the bonding curve:

```
Current Price = Virtual_SOL_Reserves / Virtual_Token_Reserves

When someone buys X tokens:
1. Virtual_Token_Reserves decreases by X
2. Virtual_SOL_Reserves increases by Y (calculated to maintain K constant)
3. SOL_Cost = Y × (1 + fees)

When someone sells X tokens:
1. Virtual_Token_Reserves increases by X
2. Virtual_SOL_Reserves decreases by Y
3. SOL_Received = Y × (1 - fees)
```

### Initial Price

```
P₀ = 30 SOL / 1,073,000,000 tokens
P₀ ≈ 0.00000002796 SOL per token
P₀ ≈ $0.0000056 USD per token (at SOL = $200)
```

### Graduation Threshold

Token graduates to open market (Raydium/Orca) when:

```
GRADUATION_MARKET_CAP = 85 SOL
```

At graduation:
- Virtual reserves depleted to ~0 SOL for bonding curve
- All 800M tokens sold
- Platform migrates liquidity to DEX
- Platform keeps 6 SOL as graduation fee (~7% of total raised)

### Why This Curve?

**Advantages**:
1. ✅ **Proven model**: Pump.fun has processed billions in volume with this exact mechanism
2. ✅ **Natural price discovery**: Price increases smoothly with demand
3. ✅ **Deep liquidity**: Early and late buyers both get fair prices
4. ✅ **Anti-manipulation**: Large buys/sells have predictable slippage
5. ✅ **Simple graduation**: Clean transition to DEX at threshold

**Comparison to Linear Curve**:
- Linear: Price = a + b×supply (predictable but can lead to unsustainable price increases)
- Constant Product: More gradual price increase, better liquidity at all stages

---

## Fee Structure

### Platform Fees (Constant)

```
PLATFORM_BUY_FEE = 1.0%
PLATFORM_SELL_FEE = 1.0%
```

Applied to SOL amount on every trade. **This fee is ALWAYS charged**, regardless of stream status.

### Creator Fees (Dynamic - Based on Stream Status)

```
CREATOR_FEE_LIVE = 2.0%     (when streamer is live)
CREATOR_FEE_OFFLINE = 0.2%   (when streamer is offline)
```

Applied to SOL amount on both buys and sells.

### Total Fee Breakdown

**When Streamer is LIVE** (streaming):
```
Buy Transaction:
- Platform: 1.0%
- Creator: 2.0%
- Total: 3.0%

Sell Transaction:
- Platform: 1.0%
- Creator: 2.0%
- Total: 3.0%

Round-trip (buy + sell): 6.0%
```

**When Streamer is OFFLINE**:
```
Buy Transaction:
- Platform: 1.0%
- Creator: 0.2%
- Total: 1.2%

Sell Transaction:
- Platform: 1.0%
- Creator: 0.2%
- Total: 1.2%

Round-trip (buy + sell): 2.4%
```

### Fee Distribution Logic

```solidity
// Pseudocode for fee calculation
function calculateFees(solAmount, isLive, isBuy) {
    platformFee = solAmount × 0.01; // Always 1%

    if (isLive) {
        creatorFee = solAmount × 0.02; // 2% when live
    } else {
        creatorFee = solAmount × 0.002; // 0.2% when offline
    }

    totalFees = platformFee + creatorFee;
    return (platformFee, creatorFee, totalFees);
}
```

### Why This Fee Structure?

1. **Incentivizes streaming**: 10x higher creator fees when live (2% vs 0.2%)
2. **Platform sustainability**: 1% platform fee ensures profitability
3. **Competitive with market**:
   - Pump.fun charges 1% total fee
   - Uniswap V3 ranges 0.05%-1%
   - Zeroglaze at 1.2%-3% is reasonable for a specialized platform
4. **Trader-friendly**: 2.4% offline fees allow for quick speculation
5. **Creates urgency**: Traders want to buy/sell when streamer is offline (lower fees) but creator benefits when live

---

## Token Distribution

### At Token Launch

```
Total Supply: 1,000,000,000 tokens

Distribution:
├── Bonding Curve (tradeable): 800,000,000 tokens (80%)
└── Creator Allocation: 200,000,000 tokens (20%)
```

### Creator Token Options

When launching, creator chooses:

**Option 1: FREEZE Creator Tokens** ✅ (Recommended - Shows GREEN FLAG)
```
- Creator's 200M tokens are locked until graduation
- Unlocked only after token graduates to DEX
- Prevents rug pulls
- Builds trader confidence
- Creator can still earn from fees
```

**Option 2: Keep Creator Tokens LIQUID** 🚩 (Shows RED FLAG)
```
- Creator's 200M tokens are immediately tradeable
- High rug pull risk
- Profile gets red flag warning
- Traders will be more cautious
```

### Why 20% Creator Allocation?

- **Industry standard**: Most fair launches allocate 10-30% to creators
- **Skin in the game**: Creator has incentive for token to succeed
- **Prevents dumping**: If frozen, creator can't immediately exit
- **Fair for traders**: 80% available for public trading is generous

---

## Graduation Mechanism

### Graduation Trigger

Token automatically graduates when bonding curve reaches:

```
GRADUATION_THRESHOLD = 85 SOL raised
```

### What Happens at Graduation?

```
1. Bonding curve is depleted
   - All 800M tokens sold from curve
   - ~85 SOL collected

2. Platform actions:
   - Takes 6 SOL as graduation fee (~7%)
   - Uses remaining 79 SOL to create liquidity pool on Raydium

3. Liquidity pool creation:
   - 79 SOL paired with 200M creator tokens (if frozen)
   - Or 79 SOL paired with purchased tokens from treasury
   - LP tokens burned (liquidity locked forever)

4. Token is now tradeable on DEX
   - Price discovery continues on Raydium
   - No more bonding curve
   - Creator tokens unlock (if frozen option was chosen)
```

### Graduation Fee Breakdown

```
Total Raised: 85 SOL
├── Platform Graduation Fee: 6 SOL (7.06%)
├── DEX Liquidity (SOL side): 79 SOL
└── DEX Liquidity (Token side): 200M tokens or equivalent
```

### Post-Graduation Economics

After graduation, platform no longer earns from this token's trades (unless we implement LP fee routing, which is advanced).

**Platform total revenue from one graduated token**:
```
Revenue = Trading Fees (during bonding curve) + Graduation Fee

Estimated:
- Trading fees: 10-20 SOL (from 85 SOL volume with ~15% avg fees)
- Graduation fee: 6 SOL
- Total: ~16-26 SOL per graduated token (~$3,200-$5,200 at SOL=$200)
```

---

## Revenue Model

### Platform Revenue Streams

**1. Trading Fees (Primary Revenue)**
```
Revenue_per_trade = Trade_Volume_SOL × 1%
```

**2. Graduation Fees (One-time per token)**
```
Revenue_per_graduation = 6 SOL (~$1,200 at SOL=$200)
```

**3. Future: Verified Creator Listing Fee (Optional)**
```
Listing_fee = 0.5-1 SOL to get verified badge
```

### Cost Structure

**Fixed Costs** (Monthly):
```
- Hosting (Vercel Pro): $20/month
- Database (Supabase Pro): $25/month
- RPC (Helius): $50/month (or free tier initially)
- Domain: $2/month
- Monitoring (Sentry): $0-26/month (free tier available)

Total Fixed: ~$100-125/month
```

**Variable Costs**:
```
- Solana transaction fees: ~$0.00025 per transaction
- Negligible at scale
```

### Break-Even Analysis

**Monthly break-even**:
```
Need to generate: $125 in revenue
At SOL = $200: Need 0.625 SOL in platform fees

Scenarios to break even:
1. 63 SOL in trading volume (0.625/0.01)
2. OR 1 token graduation (6 SOL) + minimal trading
3. OR 100 verified creators at 0.00625 SOL each

Conclusion: Break-even is trivial. Even with 10 active tokens trading
$100/day each = $1,000/day = $30,000/month revenue.
```

### Revenue Projections

**Conservative Scenario** (100 tokens, low volume):
```
Assumptions:
- 100 active tokens on platform
- Average 2 SOL trading volume per token per day
- 10% graduation rate per month (10 tokens graduate)

Monthly Revenue:
- Trading fees: 100 tokens × 2 SOL/day × 30 days × 1% = 60 SOL
- Graduation fees: 10 tokens × 6 SOL = 60 SOL
- Total: 120 SOL/month = $24,000/month

Profit: $24,000 - $125 = $23,875/month
```

**Moderate Scenario** (500 tokens, medium volume):
```
Assumptions:
- 500 active tokens
- Average 5 SOL trading volume per token per day
- 15% graduation rate per month (75 tokens graduate)

Monthly Revenue:
- Trading fees: 500 × 5 × 30 × 1% = 750 SOL
- Graduation fees: 75 × 6 = 450 SOL
- Total: 1,200 SOL/month = $240,000/month

Profit: $240,000 - $125 = $239,875/month
```

**Optimistic Scenario** (2,000 tokens, high volume):
```
Assumptions:
- 2,000 active tokens
- Average 10 SOL trading volume per token per day
- 20% graduation rate per month (400 tokens graduate)

Monthly Revenue:
- Trading fees: 2,000 × 10 × 30 × 1% = 6,000 SOL
- Graduation fees: 400 × 6 = 2,400 SOL
- Total: 8,400 SOL/month = $1,680,000/month

Profit: ~$1.68M/month
```

**Pump.fun for reference** (real numbers):
- Launched May 2024
- By December 2024: Generated >$100M in fees
- Average: >$15M/month in fees
- They charge 1% total (we charge 1% platform + variable creator)

---

## Profitability Analysis

### For Traders

**Break-even calculation**:
```
When streamer is LIVE (3% buy + 3% sell = 6% round-trip):
- Token must increase by 6.38% to break even
- For 2x: Token must go from $X to $2.1276X (+112.76%)
- For 10x: Token must go from $X to $10.638X (+963.8%)

When streamer is OFFLINE (1.2% buy + 1.2% sell = 2.4% round-trip):
- Token must increase by 2.45% to break even
- For 2x: Token must go from $X to $2.049X (+104.9%)
- For 10x: Token must go from $X to $10.244X (+924.4%)
```

**Realistic returns** (based on bonding curve):
```
Entry at 1M tokens sold (early):
- Price: ~$0.000006
- Exit at 400M sold: ~$0.00015
- Price increase: 25x
- After fees (6%): 23.5x actual return ✅ VERY ATTRACTIVE

Entry at 400M tokens sold (mid):
- Price: ~$0.00015
- Exit at 700M sold (near graduation): ~$0.0008
- Price increase: 5.33x
- After fees: 5x actual return ✅ GOOD

Entry at 700M tokens sold (late):
- Price: ~$0.0008
- Exit at 800M sold (graduation): ~$0.0013
- Price increase: 1.625x
- After fees: 1.53x actual return ⚠️ RISKY
```

**Conclusion**: Early buyers have realistic 10-25x potential. Mid buyers 3-5x. Late buyers might not profit.

### For Streamers

**Earnings per stream session** (4-hour stream):

```
Scenario 1: Low Volume Token
- Total trading volume during 4h stream: 2 SOL
- Creator fee (2% when live): 2 × 0.02 = 0.04 SOL
- Earnings: $8 per session

Scenario 2: Medium Volume Token
- Total trading volume during 4h stream: 10 SOL
- Creator fee: 10 × 0.02 = 0.2 SOL
- Earnings: $40 per session ✅

Scenario 3: Viral Token
- Total trading volume during 4h stream: 50 SOL
- Creator fee: 50 × 0.02 = 1 SOL
- Earnings: $200 per session ✅✅

Scenario 4: Token Near Graduation
- Total trading volume during 4h stream: 100 SOL
- Creator fee: 100 × 0.02 = 2 SOL
- Earnings: $400 per session 🚀
```

**Monthly earnings** (streaming 20 days/month, 4h per day):
```
Low volume: $8 × 20 = $160/month
Medium volume: $40 × 20 = $800/month ✅
High volume: $200 × 20 = $4,000/month ✅✅
Viral: $400 × 20 = $8,000/month 🚀
```

**Additional**: If creator froze 200M tokens and token graduates, those tokens are now worth:
```
Post-graduation price: ~$0.0013 per token
200M tokens × $0.0013 = $260,000 value
(Actual sellable value will be lower due to liquidity constraints)
```

**Conclusion**: Even small streamers can earn $500-$1,000/month. Successful streamers can earn $5,000-$10,000/month.

### For Platform

**Per-token lifecycle revenue**:
```
From launch to graduation (85 SOL raised):

Trading fees collected:
- Estimate ~20% of volume is fees
- 85 SOL raised ÷ 1.01 (1% platform fee) = ~84 SOL before platform fees
- Platform fees: ~0.84 SOL during curve
- Plus graduation fee: 6 SOL
- Total: ~6.84 SOL per token lifecycle

At 100 tokens graduating per month:
- Revenue: 684 SOL/month = $136,800/month
```

**Scaling math**:
```
If 1% of tokens graduate per month (realistic):
- Need 10,000 active tokens for 100 graduations/month
- At average 5 SOL/day volume per token: 50,000 SOL daily volume
- Daily platform fees: 500 SOL = $100,000/day
- Monthly: $3,000,000

Conservative estimate: Capture 0.1% of Pump.fun volume = $150,000/month
```

---

## Example Scenarios

### Example 1: Successful Token Lifecycle

```
Day 1: Token launches
- Streamer creates token
- Initial buyers purchase 50M tokens for ~0.5 SOL
- Price: $0.000006/token
- Platform fees: 0.005 SOL
- Creator fees: 0.01 SOL (if streaming)

Week 1: Growing interest
- Volume: 10 SOL traded
- 200M tokens sold (25% of curve)
- Price now: $0.00003/token (5x from start)
- Platform fees earned: 0.1 SOL
- Creator fees earned: 0.2 SOL (if streaming 50% of time)

Month 1: Token goes viral
- 600M tokens sold (75% of curve)
- Price now: $0.0005/token (83x from start)
- Total volume: 60 SOL
- Platform fees: 0.6 SOL
- Creator fees: 1.2 SOL

Month 2: Graduation
- Remaining 200M tokens sold
- Total raised: 85 SOL
- Token graduates to Raydium
- Platform takes 6 SOL graduation fee
- Platform total revenue from this token: ~6.6 SOL ($1,320)
- Creator total revenue: ~1.5 SOL from fees + 200M tokens worth ~$260,000
```

### Example 2: Failed Token (No Graduation)

```
Month 1: Token launches but doesn't catch on
- Only 100M tokens sold (12.5% of curve)
- Volume: 2 SOL total
- Price: $0.00001/token
- Platform fees: 0.02 SOL ($4)
- Creator fees: 0.04 SOL ($8)

Month 2-6: Slow death
- Trading dries up
- Token sits at 100M sold forever
- No graduation
- Platform made $4 total from this token
- Creator made $8 total

Conclusion: Even failed tokens contribute small revenue. Platform should
aim for 10% graduation rate among all tokens for profitability.
```

### Example 3: Day Trader Profits

```
Trader buys during offline hours (low fees):
- Buys 10M tokens at $0.00005 (when 300M sold)
- Cost: 0.5 SOL + 1.2% fees = 0.506 SOL

Streamer goes live next day, trading volume spikes:
- Price increases to $0.0002 (4x)
- Trader sells 10M tokens during stream
- Receives: 2 SOL - 3% fees = 1.94 SOL

Profit: 1.94 - 0.506 = 1.434 SOL = $286 profit (283% ROI) ✅

Conclusion: Smart traders can time trades around stream status for profit.
```

---

## Implementation Constants

### Smart Contract Constants

```rust
// Token Supply
pub const TOTAL_SUPPLY: u64 = 1_000_000_000; // 1 billion
pub const CURVE_SUPPLY: u64 = 800_000_000;   // 800 million tradeable
pub const CREATOR_SUPPLY: u64 = 200_000_000; // 200 million to creator

// Virtual Reserves
pub const VIRTUAL_SOL_INITIAL: u64 = 30_000_000_000; // 30 SOL in lamports
pub const VIRTUAL_TOKEN_INITIAL: u64 = 1_073_000_000; // 1.073 billion tokens

// Bonding Curve Constant
pub const K: u128 = 32_190_000_000_000_000_000; // VIRTUAL_SOL × VIRTUAL_TOKEN

// Fees (in basis points, 100 = 1%)
pub const PLATFORM_FEE_BPS: u16 = 100;         // 1%
pub const CREATOR_FEE_LIVE_BPS: u16 = 200;     // 2%
pub const CREATOR_FEE_OFFLINE_BPS: u16 = 20;   // 0.2%

// Graduation
pub const GRADUATION_THRESHOLD_SOL: u64 = 85_000_000_000; // 85 SOL in lamports
pub const GRADUATION_FEE_SOL: u64 = 6_000_000_000;        // 6 SOL in lamports
```

### TypeScript/Frontend Constants

```typescript
export const BONDING_CURVE_CONFIG = {
  totalSupply: 1_000_000_000,
  curveSupply: 800_000_000,
  creatorSupply: 200_000_000,

  virtualSolReserves: 30, // SOL
  virtualTokenReserves: 1_073_000_000, // tokens

  platformFeeBps: 100,  // 1%
  creatorFeeLiveBps: 200,  // 2%
  creatorFeeOfflineBps: 20, // 0.2%

  graduationThresholdSol: 85,
  graduationFeeSol: 6,
} as const;

// Price calculation helper
export function calculatePrice(tokensSold: number): number {
  const virtualSol = BONDING_CURVE_CONFIG.virtualSolReserves;
  const virtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves - tokensSold;
  return virtualSol / virtualTokens;
}

// Buy cost calculation
export function calculateBuyCost(
  currentTokensSold: number,
  tokensToBuy: number,
  isLive: boolean
): { solCost: number; platformFee: number; creatorFee: number; total: number } {
  const k = BONDING_CURVE_CONFIG.virtualSolReserves *
            BONDING_CURVE_CONFIG.virtualTokenReserves;

  const newVirtualTokens = BONDING_CURVE_CONFIG.virtualTokenReserves -
                           (currentTokensSold + tokensToBuy);
  const newVirtualSol = k / newVirtualTokens;

  const solRequired = newVirtualSol - BONDING_CURVE_CONFIG.virtualSolReserves;

  const platformFee = solRequired * 0.01;
  const creatorFee = solRequired * (isLive ? 0.02 : 0.002);
  const total = solRequired + platformFee + creatorFee;

  return { solCost: solRequired, platformFee, creatorFee, total };
}
```

---

## Key Takeaways

1. **Bonding Curve**: Use constant product AMM (proven by Pump.fun) with 800M tokens and 85 SOL graduation threshold

2. **Fee Structure**:
   - Platform: 1% always
   - Creator: 2% when live, 0.2% when offline
   - Creates strong streaming incentive

3. **Revenue Model**:
   - Platform earns ~6-7 SOL per graduated token
   - Break-even at <10 active tokens
   - Profit potential: $100K-$1M+/month at scale

4. **Trader Returns**:
   - Early buyers: 10-25x realistic
   - Mid buyers: 3-5x realistic
   - Late buyers: 1.5-2x (risky)

5. **Streamer Earnings**:
   - Low tier: $100-500/month
   - Mid tier: $500-2,000/month
   - High tier: $2,000-10,000/month
   - Plus token appreciation if frozen

6. **Profitability**: Platform is profitable from day 1 with even minimal volume

---

## References

- [The Math Behind Pump.fun - Medium](https://medium.com/@buildwithbhavya/the-math-behind-pump-fun-b58fdb30ed77)
- [Understanding Bonding Curves - Flashift](https://flashift.app/blog/bonding-curves-pump-fun-meme-coin-launches/)
- [Memecoin Launchpad with Bonding Curve - Antier Solutions](https://www.antiersolutions.com/blogs/how-to-build-a-memecoin-launchpad-with-an-integrated-bonding-curve/)
- [Bonding Curves: Fairest Token Launch - Medium](https://medium.com/coinmonks/bonding-curves-the-fairest-way-to-launch-tokens-2e7369f19099)

---

**Last Updated**: December 24, 2024
**Status**: Ready for implementation
