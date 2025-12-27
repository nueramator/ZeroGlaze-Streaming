# Viral Loop Engineering & Referral System Architecture

**Last Updated:** December 26, 2025
**Owner:** Growth Team
**Status:** Implementation Ready

---

## Overview

This document details the technical and strategic implementation of Zeroglaze's viral growth mechanisms. Each loop is designed to compound user acquisition through natural platform usage.

**Target Viral Coefficient:** K > 1.0 (self-sustaining growth)
**Current Baseline:** K = 0 (no loops active)
**Timeline:** Achieve K = 1.0 by Day 60

---

## Viral Loop 1: Streamer → Trader → Discovery

### Mechanism Flow

```
┌─────────────────┐
│ Streamer Launches│
│     Token        │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ Announces to Community  │
│ (Discord, Stream, Twitter)│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 50 Fans Buy Token       │
│ (10% conversion)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Fans Browse Platform    │
│ Discover Other Tokens   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 30% Try Another Token   │
│ (15 cross-traders)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 1-2 Become Regular      │
│ Traders (3+ visits/week)│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Each Refers 0.5 Friends │
│ (25 new traders)        │
└─────────────────────────┘
```

### Mathematical Model

**Input:** 1 streamer launches token

**Outputs:**
- Direct traders: 50 (10% of 500-person community)
- Cross-platform traders: 15 (30% explore other tokens)
- Regular traders created: 2 (1 per 37.5 traders)
- Referred traders: 25 (50 × 0.5 referral rate)
- Total new traders: 75

**Viral coefficient (trader side):** 0.5
**If 1 in 75 traders becomes streamer:** +1.0 = Total K = 1.5

### Optimization Tactics

**Increase Initial Conversion (10% → 15%)**
- Streamer onboarding: Teach how to announce effectively
- Provide copy templates: "I just launched my token - buy at [link]"
- Create urgency: "First 50 buyers get exclusive role"
- Social proof: Show existing holder count live

**Increase Cross-Platform Trading (30% → 45%)**
- Smart recommendations: "Traders who bought $TICKER1 also bought $TICKER2"
- Discovery feed: Personalized based on viewing history
- Time-based: "New tokens launched in last 24h"
- Category filters: Gaming, Music, Art, Comedy

**Increase Regular Trader Conversion (2.7% → 5%)**
- Onboarding sequence: 3-email drip teaching advanced strategies
- Quick wins: Surface tokens likely to move (high volume, trending)
- Gamification: "Complete 3 trades this week to unlock perks"
- Community: Discord channels for trading discussion

**Increase Referral Rate (0.5 → 1.0)**
- See "Loop 4: Referral Mechanics" below

### Metrics & Tracking

```sql
-- Track Loop 1 Performance
WITH streamer_cohorts AS (
  SELECT
    token_id,
    launched_at,
    COUNT(DISTINCT trader_wallet) as direct_traders,
    COUNT(DISTINCT CASE
      WHEN trader_has_other_tokens = true
      THEN trader_wallet
    END) as cross_traders
  FROM trades
  WHERE created_at < launched_at + INTERVAL '7 days'
  GROUP BY token_id, launched_at
)
SELECT
  AVG(direct_traders) as avg_direct,
  AVG(cross_traders) as avg_cross,
  AVG(cross_traders::float / NULLIF(direct_traders, 0)) as cross_rate
FROM streamer_cohorts
WHERE launched_at > NOW() - INTERVAL '30 days';
```

**Dashboard Metrics:**
- Avg traders per token launch (target: 50)
- Cross-trading rate (target: 45%)
- Regular trader conversion (target: 5%)
- Referral rate (target: 1.0)

---

## Viral Loop 2: Win → Share → FOMO

### Mechanism Flow

```
┌─────────────────┐
│ Trader Wins Big │
│   (5x+ gain)    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Auto-Generated Graphic   │
│ "I just 5x'd on $TICKER" │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ One-Click Share to       │
│ Twitter/Discord (30%)    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Followers See Win        │
│ Experience FOMO          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 10% Click Through        │
│ to Platform              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 50% Connect Wallet       │
│ 30% Make First Trade     │
└──────────────────────────┘
```

### Mathematical Model

**Assumptions:**
- 100 traders achieve 5x+ gain per week
- 30% share their win (30 shares)
- Each share seen by 500 people (avg Twitter reach)
- 10% click through (1,500 clicks)
- 50% connect wallet (750 connections)
- 30% trade (225 new traders)

**Viral coefficient contribution:** 225 / 100 = 2.25 per winner

**However, winners are outcome of existing traders, so:**
- If 5% of traders win 5x+ per week
- K contribution = 0.05 × 2.25 = 0.1125

### Win Graphic Design Specs

**Template Components:**

1. **Background:** Gradient (green for gains)
2. **Large Text:** "I JUST [X]'d ON ZEROGLAZE"
3. **Token Details:**
   - Token name: $TICKER
   - Entry price: $X
   - Exit price: $Y
   - Gain: +XXX%
4. **Visual:** Rocket emoji or chart graphic
5. **Branding:** Zeroglaze logo + "zeroglaze.app"
6. **Referral:** Personalized link embedded in image

**Milestones Triggering Graphics:**
- 2x (100% gain)
- 5x (400% gain)
- 10x (900% gain)
- 50x (4,900% gain)
- 100x (9,900% gain)

**Trigger Logic:**

```typescript
// Pseudo-code for win graphic trigger
function checkForWinGraphicTrigger(trade: Trade) {
  const position = getPosition(trade.trader, trade.token);
  const gainMultiple = position.currentValue / position.costBasis;

  const milestones = [2, 5, 10, 50, 100];
  const nextMilestone = milestones.find(m =>
    gainMultiple >= m && !position.sharedMilestones.includes(m)
  );

  if (nextMilestone) {
    showShareModal({
      milestone: nextMilestone,
      token: trade.token,
      entry: position.avgBuyPrice,
      current: position.currentPrice,
      gain: (gainMultiple - 1) * 100
    });
  }
}
```

**Share Modal UX:**

1. **Auto-popup** when milestone hit (can dismiss)
2. **Preview** of graphic before sharing
3. **One-click buttons:**
   - "Share to Twitter" (pre-filled tweet)
   - "Download Image" (save to device)
   - "Copy Link" (referral URL)
4. **Customization:**
   - Optional message addition
   - Tag friends (Twitter)
5. **Incentive:** "Share to enter weekly giveaway"

**Pre-filled Tweet Template:**

```
I just [X]'d my money on $TICKER! 🚀

Entry: $[price]
Now: $[price]
Gain: +[X]%

Trading streamer tokens on @zeroglaze

Try it: [referral_link]
```

### A/B Testing Strategy

**Test 1: Share Incentive**
- Control: No incentive
- A: "Share to unlock lower fees"
- B: "Share to enter $100 giveaway"
- C: "Share and we'll donate $1 to streamer"

**Test 2: Graphic Style**
- Control: Clean, professional
- A: Meme-style (wojak, pepe)
- B: Animated GIF
- C: Video clip (3 seconds)

**Test 3: Timing**
- Control: Immediate on milestone
- A: 5 minutes after (let excitement build)
- B: Next day (email reminder)
- C: Manual (button on dashboard)

### Metrics & Tracking

**Funnel Metrics:**
- Win milestone achieved (baseline)
- Share modal shown (100% of milestones)
- Graphic generated (100% of modals)
- Share button clicked (target: 30%)
- Tweet posted (target: 25% of clicks)
- Referral link clicks (target: 50 per share)
- Wallet connections (target: 25 per share)
- First trades (target: 7.5 per share)

**Performance Query:**

```sql
-- Win sharing performance
SELECT
  DATE_TRUNC('week', milestone_achieved_at) as week,
  COUNT(*) as total_milestones,
  COUNT(CASE WHEN shared = true THEN 1 END) as shares,
  COUNT(CASE WHEN shared = true THEN 1 END)::float / COUNT(*) as share_rate,
  SUM(referral_clicks) as total_clicks,
  SUM(referral_conversions) as total_conversions
FROM win_milestones
WHERE milestone_achieved_at > NOW() - INTERVAL '90 days'
GROUP BY week
ORDER BY week DESC;
```

---

## Viral Loop 3: Leaderboard Competition

### Mechanism Flow

```
┌──────────────────────┐
│ Platform Shows       │
│ "Top Gainers Today"  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Streamers Compete    │
│ to Rank Higher       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Promote More Actively│
│ to Drive Token Price │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Attract More Traders │
│ to Their Token       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Higher Volume =      │
│ Featured Placement   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Featured Tokens Get  │
│ More New Traders     │
└──────────────────────┘
```

### Leaderboard Categories

**1. Top Volume (Most Important)**
- 24-hour volume
- 7-day volume
- 30-day volume
- All-time volume

**2. Fastest Growing**
- % price change (24h)
- % holder growth (24h)
- % volume growth vs. yesterday

**3. Community Size**
- Most unique holders
- Most active traders (7d)
- Highest avg hold time

**4. Market Cap**
- Current market cap
- ATH market cap
- Market cap growth (7d)

**5. Longevity**
- Oldest token still active
- Most consistent volume (30d)
- Most days in top 10

### Visibility Strategy

**Homepage Feature Section:**
```
┌─────────────────────────────────┐
│         TOP TOKENS TODAY         │
├─────────────────────────────────┤
│ 🔥 Trending                      │
│ $TICKER1  +245%  $50K vol       │
│ $TICKER2  +189%  $32K vol       │
│ $TICKER3  +156%  $28K vol       │
├─────────────────────────────────┤
│ 📈 Highest Volume                │
│ $TICKER4  $120K  +45%           │
│ $TICKER5  $95K   +23%           │
│ $TICKER6  $78K   +67%           │
├─────────────────────────────────┤
│ 🌟 Most Holders                  │
│ $TICKER7  1,234 holders         │
│ $TICKER8  987 holders           │
│ $TICKER9  856 holders           │
└─────────────────────────────────┘
```

**Dedicated Leaderboard Page:**
- Tabs for each category
- Filters: 24h, 7d, 30d, All-time
- Search functionality
- Export to CSV (for nerds)

**Twitter Automation:**

Daily at 9 AM EST:
```
🏆 Yesterday's Top Tokens:

1. $TICKER (+245%, $50K vol)
   @streamer crushed it

2. $TICKER (+189%, $32K vol)
   @streamer killing it

3. $TICKER (+156%, $28K vol)
   @streamer on fire

Full leaderboard: [link]
```

**Discord Bot Commands:**

```
/leaderboard [category] [timeframe]
/rank $TICKER
/compare $TICKER1 $TICKER2
```

**Email Digest (Weekly):**
```
Your Weekly Zeroglaze Recap

YOUR TOKENS:
- $TICKER: #12 in volume (+3 spots from last week)
- $TICKER2: #45 in holders (-2 spots)

TOP MOVERS:
- [Top 3 tokens with their streamers]

GOAL FOR NEXT WEEK:
Get $TICKER into top 10 by driving [X]% more volume
```

### Gamification Mechanics

**Badges (Auto-Awarded):**

| Badge | Criteria | Rarity |
|-------|----------|--------|
| First Launch | Launch a token | Common |
| Volume King | #1 in daily volume | Rare |
| Viral Token | 1,000+ holders | Epic |
| Diamond Market | $1M+ market cap | Legendary |
| Consistency | Top 20 for 30 days | Epic |
| Early Mover | Top 10 in first week | Rare |

**Streamer Achievements:**

- Earn Your First $100
- 100 Unique Holders
- $10K Daily Volume
- Featured on Homepage
- Graduated to DEX
- 1,000x from Launch

**Prizes for Rankings:**

**Weekly Top 3 Volume:**
- 1st: $200 SOL + Featured AMA
- 2nd: $100 SOL + Twitter spotlight
- 3rd: $50 SOL + Discord announcement

**Monthly Hall of Fame:**
- Top token of the month featured for entire next month
- Streamer interview published
- Custom badge: "Token of the Month - [Month]"

### Competition Psychology

**Why This Works:**

1. **Status:** Public ranking = social proof
2. **Loss Aversion:** Don't want to drop in rankings
3. **Achievable Goals:** Can see next rank and what it takes
4. **Relative Progress:** Comparison to peers motivates
5. **Recognition:** Being featured = dopamine hit

**Streamer Behavior Changes:**

- Stream more frequently (more eyes on token)
- Promote token more actively (drive volume)
- Engage community (encourage holding/trading)
- Collaborate with other streamers (cross-promotion)
- Create content around rankings (status flex)

### Metrics & Tracking

**Engagement Metrics:**
- Leaderboard page views (target: 30% of users check weekly)
- Time on leaderboard page (target: 2+ min)
- Discord bot command usage (target: 100+ queries/day)
- Twitter leaderboard post engagement (target: 5%+ rate)

**Behavior Metrics:**
- Correlation: Ranking → streaming frequency
- Correlation: Ranking → token promotion mentions
- Volume lift for featured tokens (target: 25%+ vs. non-featured)

**Query:**

```sql
-- Leaderboard effectiveness
WITH featured_tokens AS (
  SELECT token_id, featured_date
  FROM homepage_features
  WHERE featured_date > NOW() - INTERVAL '30 days'
),
volume_comparison AS (
  SELECT
    f.token_id,
    AVG(CASE
      WHEN t.date < f.featured_date THEN t.volume
    END) as avg_volume_before,
    AVG(CASE
      WHEN t.date >= f.featured_date THEN t.volume
    END) as avg_volume_after
  FROM featured_tokens f
  JOIN daily_token_volume t ON f.token_id = t.token_id
  GROUP BY f.token_id
)
SELECT
  AVG((avg_volume_after - avg_volume_before) / NULLIF(avg_volume_before, 0) * 100) as avg_lift_pct
FROM volume_comparison;
```

---

## Viral Loop 4: Referral Program

### Economic Model

**Platform Fee Structure:**
- Total trading fee: 1%
- Platform keeps: 0.9%
- Referrer earns: 0.1%

**Lifetime Value Calculation:**

Average trader:
- Monthly volume: $1,000
- Platform fee (1%): $10
- Referrer share (0.1%): $1/month
- 12-month LTV: $12 per referral

Power user (top 10%):
- Monthly volume: $10,000
- Platform fee: $100
- Referrer share: $10/month
- 12-month LTV: $120 per referral

**Referrer Economics:**

| Referrals | Avg Monthly Income | Annual Income |
|-----------|-------------------|---------------|
| 10 | $10 | $120 |
| 50 | $50 | $600 |
| 100 | $100 | $1,200 |
| 500 | $500 | $6,000 |
| 1,000 | $1,000 | $12,000 |

**Top Referrer Potential:**

If you refer:
- 10 streamers who each bring 50 traders = 500 traders
- Each trader does $1K/month = $500K monthly volume
- Your cut (0.1%) = $500/month = $6K/year

**Tiered Bonus Structure:**

| Tier | Referrals | Base Rate | Bonus | Total Rate |
|------|-----------|-----------|-------|------------|
| Starter | 1-9 | 0.10% | - | 0.10% |
| Builder | 10-49 | 0.10% | +0.02% | 0.12% |
| Growth | 50-99 | 0.10% | +0.05% | 0.15% |
| Elite | 100-499 | 0.10% | +0.08% | 0.18% |
| Legend | 500+ | 0.10% | +0.12% | 0.22% |

### Technical Implementation

**URL Parameter Tracking:**

```
https://zeroglaze.app?ref=WALLET_ADDRESS
https://zeroglaze.app/token/TICKER?ref=WALLET_ADDRESS
```

**Cookie/LocalStorage:**
- Store referrer wallet in localStorage
- 30-day attribution window
- First-touch attribution (first ref= wins)

**Database Schema:**

```sql
-- Referral tracking table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_wallet VARCHAR(44) NOT NULL,
  referee_wallet VARCHAR(44) NOT NULL,
  referred_at TIMESTAMP DEFAULT NOW(),
  first_trade_at TIMESTAMP,
  total_volume DECIMAL(20, 2) DEFAULT 0,
  referrer_earnings DECIMAL(20, 2) DEFAULT 0,
  status VARCHAR(20), -- pending, active, inactive
  source VARCHAR(50), -- twitter, discord, direct, etc.
  UNIQUE(referee_wallet)
);

-- Referral earnings ledger
CREATE TABLE referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id),
  trade_id UUID REFERENCES trades(id),
  amount DECIMAL(20, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referral tiers
CREATE TABLE referral_tiers (
  wallet VARCHAR(44) PRIMARY KEY,
  tier VARCHAR(20), -- starter, builder, growth, elite, legend
  total_referrals INT DEFAULT 0,
  active_referrals INT DEFAULT 0,
  lifetime_earnings DECIMAL(20, 2) DEFAULT 0,
  bonus_rate DECIMAL(5, 4) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Smart Contract Integration:**

```rust
// Pseudo-code for on-chain referral tracking
pub fn execute_trade_with_referral(
    ctx: Context<Trade>,
    amount: u64,
    referrer: Option<Pubkey>
) -> Result<()> {
    let platform_fee = amount * 100 / 10000; // 1%

    if let Some(referrer_key) = referrer {
        let referral_fee = amount * 10 / 10000; // 0.1%
        let platform_net = platform_fee - referral_fee;

        // Transfer fees
        transfer_sol(ctx, fee_account, platform_net)?;
        transfer_sol(ctx, referrer_key, referral_fee)?;

        // Emit event for tracking
        emit!(ReferralReward {
            referrer: referrer_key,
            referee: ctx.accounts.trader.key(),
            amount: referral_fee,
        });
    } else {
        transfer_sol(ctx, fee_account, platform_fee)?;
    }

    Ok(())
}
```

### Dashboard Features

**Referrer Dashboard:**

```
┌─────────────────────────────────────┐
│       REFERRAL DASHBOARD             │
├─────────────────────────────────────┤
│ YOUR STATS                           │
│ Total Referrals: 47                  │
│ Active Referrals: 23 (traded in 30d) │
│ Tier: Builder (0.12% rate)           │
│                                      │
│ EARNINGS                             │
│ This Month: $67.50                   │
│ Last Month: $54.20                   │
│ All-Time: $234.80                    │
│ Next Payout: Dec 31 ($67.50)        │
│                                      │
│ YOUR LINK                            │
│ zeroglaze.app?ref=ABC123             │
│ [Copy Link] [Share to Twitter]      │
│                                      │
│ TOP REFERRALS                        │
│ 1. user456... $145 volume this month │
│ 2. user789... $123 volume this month │
│ 3. user012... $98 volume this month  │
│                                      │
│ NEXT TIER                            │
│ You need 3 more referrals to reach   │
│ Growth tier (0.15% rate)             │
│ Potential earnings boost: +$1.20/mo  │
└─────────────────────────────────────┘
```

**Referee Experience:**

Upon signup with referral link:
```
┌─────────────────────────────────────┐
│ You were referred by user123        │
│                                      │
│ 🎉 YOUR BONUS:                       │
│ 50% off your first trade!            │
│                                      │
│ Plus they'll earn from your trading  │
│ (doesn't cost you anything)          │
│                                      │
│           [Continue]                 │
└─────────────────────────────────────┘
```

### Marketing Assets

**Auto-Generated Graphics:**

1. **Earnings Milestone Graphics**
   - "I've earned $100 from Zeroglaze referrals"
   - "I've earned $500 from Zeroglaze referrals"
   - "I've earned $1,000 from Zeroglaze referrals"
   - Share to flex + attract more referrals

2. **Tier Achievement Graphics**
   - "I just hit Elite tier on Zeroglaze"
   - Shows tier badge, total referrals, earnings

3. **Referral Stats Cards**
   - Weekly summary of performance
   - Shareable image with key stats

**Email Templates:**

**Welcome Email (After First Referral):**
```
Subject: You just earned your first referral on Zeroglaze!

Congrats [Name]!

[Referee Name] just signed up with your link. Here's what happens next:

1. They trade on Zeroglaze
2. You earn 0.1% of their trading fees (forever)
3. Money hits your wallet monthly

YOUR STATS:
- Total referrals: 1
- Projected monthly earnings: $[X]

Want to earn more? Share your link:
[Your link]

Here's what top referrers do:
- Post win graphics on Twitter
- Share in crypto Discord servers
- Create content about the platform

Questions? Hit reply.

The Zeroglaze Team
```

**Monthly Performance Email:**
```
Subject: Your referral earnings: $[X] this month

Hey [Name],

Your December referral report:

EARNINGS:
- This month: $67.50 (+24% from Nov)
- Paid to wallet: [wallet address]
- Next payout: Jan 1

YOUR REFERRALS:
- Total: 47 (+3 this month)
- Active: 23 (traded in last 30d)
- Top performer: user456 ($145 volume)

TIER PROGRESS:
- Current: Builder (0.12% rate)
- Next: Growth (0.15% rate)
- Needed: 3 more referrals

LEADERBOARD:
You're #12 this month. Top referrer earned $1,234.

Keep sharing: [Your link]

The Zeroglaze Team
```

### Distribution Strategy

**Week 1: Announce Program**

Tweet thread:
```
We're launching the most generous referral program in crypto.

Earn 0.1% of ALL trading fees from anyone you refer. Forever.

Here's how much you could make: 🧵👇

[10-tweet thread breaking down economics]
```

**Week 2-4: Seed Power Users**

- Identify top 20 traders by volume
- Email them directly with referral opportunity
- Offer bonus: "Refer 10 people in next 7 days, get $50 SOL"
- Goal: Create success stories for social proof

**Week 5+: Ongoing Promotion**

- Weekly Twitter post: "Top referrer earned $X this week"
- Discord channel: #referral-wins for celebrations
- Email reminders to users who haven't shared yet
- Retargeting: Users who clicked share but didn't complete

### Gamification & Incentives

**Leaderboard:**
```
Top Referrers This Month

1. crypto_god.eth     127 referrals    $1,234 earned
2. stream_king.sol    89 referrals     $892 earned
3. degen_trader.xyz   67 referrals     $678 earned
...
10. you               47 referrals     $456 earned

🏆 Top 3 get featured on our Twitter (50K followers)
```

**Bonuses & Contests:**

- **Monthly Top Referrer:** Extra $500 SOL
- **Refer a Streamer Bonus:** $25 SOL (streamers bring more volume)
- **Referral Milestones:**
  - 10 refs: $10 SOL
  - 50 refs: $50 SOL
  - 100 refs: $100 SOL + Featured interview

### Fraud Prevention

**Red Flags:**
- Same IP address for multiple referrals
- Referrals signing up but never trading
- Wallet addresses following patterns
- Unusually high referral rate from one source

**Prevention Measures:**
- Require minimum trade volume before referrer earns (0.1 SOL)
- Manual review of accounts with 20+ referrals
- IP fingerprinting and duplicate detection
- Gradual payout (earn as referrals trade, not upfront)
- Ban policy: Fraud = forfeit all earnings + platform ban

**Monitoring Query:**

```sql
-- Flag suspicious referral patterns
WITH referrer_stats AS (
  SELECT
    referrer_wallet,
    COUNT(*) as total_refs,
    COUNT(CASE WHEN first_trade_at IS NULL THEN 1 END) as inactive_refs,
    COUNT(DISTINCT referee_ip) as unique_ips,
    AVG(total_volume) as avg_referee_volume
  FROM referrals
  WHERE referred_at > NOW() - INTERVAL '30 days'
  GROUP BY referrer_wallet
)
SELECT *
FROM referrer_stats
WHERE
  (inactive_refs::float / total_refs > 0.5 AND total_refs > 10)  -- >50% inactive
  OR (unique_ips < total_refs * 0.5)  -- Many refs from same IPs
  OR (avg_referee_volume < 10)  -- Suspiciously low volume
ORDER BY total_refs DESC;
```

### Success Metrics

**Adoption Metrics:**
- % of users who create referral link (target: 60%)
- % of users who share referral link (target: 25%)
- % of new users from referrals (target: 40% by Week 12)

**Economic Metrics:**
- Average referrals per active referrer (target: 5)
- Referral conversion rate (signup → first trade) (target: 40%)
- Average referrer monthly earnings (target: $50)

**Viral Coefficient:**
- K from referrals alone (target: 0.4 by Week 12)
- Combined K with other loops (target: 1.0 by Week 12)

---

## Combined Viral Coefficient Model

### Inputs (Conservative Estimates)

**Loop 1: Streamer → Trader**
- Each streamer brings: 50 initial traders
- Cross-trading rate: 30% (15 explore other tokens)
- Referral rate: 0.5 (25 more traders)
- Total: 75 traders per streamer
- **K contribution if 1.5% of traders become streamers:** 1.125

**Loop 2: Win → Share**
- 5% of traders achieve shareable win per week
- 30% share publicly
- Each share drives 10 new traders
- **K contribution:** 0.05 × 0.30 × 10 = 0.15

**Loop 3: Leaderboard**
- Featured tokens get 25% volume boost
- Volume boost → 10% more traders
- Top 10 featured (3% of tokens)
- **K contribution:** 0.03 × 0.10 = 0.003 (negligible directly, but amplifies Loop 1)

**Loop 4: Referral Program**
- 25% of users actively refer
- Average 2 successful referrals per active referrer
- **K contribution:** 0.25 × 2 = 0.5

### Total Viral Coefficient

**Compounding:**
K_total = K_streamer + K_wins + K_referral + (interactions)

**Conservative:**
K = 1.125 × 0.8 + 0.15 + 0.5 = 1.55

**Pessimistic (if metrics underperform):**
K = 0.75 × 0.8 + 0.10 + 0.3 = 1.0

**Optimistic (if metrics exceed targets):**
K = 1.5 × 0.9 + 0.25 + 0.7 = 2.3

### Growth Projections

**Starting:** 30 tokens, 2,000 traders (Week 4)

**With K = 1.0 (Sustainable):**
- Week 8: 60 tokens, 4,000 traders
- Week 12: 120 tokens, 8,000 traders
- Week 16: 240 tokens, 16,000 traders

**With K = 1.5 (Viral Growth):**
- Week 8: 68 tokens, 5,000 traders
- Week 12: 153 tokens, 12,500 traders
- Week 16: 345 tokens, 31,250 traders

**With K = 2.0 (Explosive Growth):**
- Week 8: 120 tokens, 8,000 traders
- Week 12: 480 tokens, 32,000 traders
- Week 16: 1,920 tokens, 128,000 traders

### Optimization Priorities

**To Maximize K:**

1. **Increase streamer conversion of traders** (Loop 1)
   - Better onboarding for potential streamers
   - "Start streaming" CTAs throughout platform
   - Partner with "how to stream" creators

2. **Increase share rate** (Loop 2)
   - Better graphic design (A/B test styles)
   - Stronger incentives (giveaway entries)
   - Reduce friction (1-click Twitter post)

3. **Increase referral participation** (Loop 4)
   - In-app prompts to share link
   - Success stories from top referrers
   - Contests and bonuses

**Priority Order (ICE Score):**
1. Referral program (Impact: 9, Confidence: 9, Ease: 7) = **11.6**
2. Win graphics (Impact: 8, Confidence: 8, Ease: 9) = **7.1**
3. Streamer conversion (Impact: 10, Confidence: 6, Ease: 4) = **15.0** ← Highest impact but hardest
4. Leaderboard (Impact: 6, Confidence: 8, Ease: 8) = **6.0**

---

## Implementation Timeline

### Week 5: Referral Program

**Tasks:**
- [ ] Smart contract updates (referral fee distribution)
- [ ] Database schema (referrals, earnings, tiers)
- [ ] URL parameter tracking (ref= attribution)
- [ ] Dashboard page (earnings, stats, link)
- [ ] Email templates (welcome, monthly report)
- [ ] Marketing assets (graphics, tweet templates)
- [ ] Launch announcement (Twitter thread, Discord, email)

**Success Criteria:**
- 40% of users generate referral link in first week
- 15% share their link publicly
- 50+ new signups via referrals in first week

### Week 6: Win Graphics

**Tasks:**
- [ ] Design graphic templates (2x, 5x, 10x, 50x, 100x)
- [ ] Trigger logic (detect milestones, track shared)
- [ ] Share modal UI (preview, customize, one-click post)
- [ ] Twitter API integration (pre-filled tweets)
- [ ] A/B test setup (test 3 graphic styles)
- [ ] Tracking (share rate, click-through, conversions)

**Success Criteria:**
- 25% of winners share their graphic
- Each share drives 5+ clicks to platform
- 10% of clicks convert to wallet connection

### Week 7: Leaderboards

**Tasks:**
- [ ] Backend: Category calculations (volume, growth, holders)
- [ ] Homepage widget (top 3 per category)
- [ ] Dedicated leaderboard page (all categories, filters)
- [ ] Discord bot commands (/leaderboard, /rank)
- [ ] Twitter automation (daily top tokens post)
- [ ] Email digest (weekly rankings to streamers)

**Success Criteria:**
- 30% of users visit leaderboard page weekly
- Featured tokens see 20%+ volume lift
- Streamers mention rankings in streams

### Week 8: Streamer Conversion Loop

**Tasks:**
- [ ] "Become a Streamer" CTAs throughout platform
- [ ] Trader → Streamer onboarding flow
- [ ] Earnings calculator ("You could earn $X/month")
- [ ] Partner with streaming education creators
- [ ] Retarget active traders with streamer pitch

**Success Criteria:**
- 2% of active traders apply to become streamers
- 50% of applicants launch token within 7 days
- New streamers bring 40+ traders average

---

## Appendix: Calculation Formulas

**Viral Coefficient (K):**
```
K = (Invites Sent per User) × (Conversion Rate)

Example:
K = 2.5 invites × 40% conversion = 1.0
```

**Viral Cycle Time (ct):**
```
ct = Average time for one viral cycle to complete

Example:
Referral link shared → Friend signs up → Trades → Refers others
ct = 3 days average
```

**Viral Growth Rate:**
```
Growth Rate = K / ct

Example:
K = 1.5, ct = 3 days
Growth Rate = 0.5 users/day/existing user
```

**User Growth Over Time:**
```
Users(t) = Users(0) × K^(t/ct)

Example:
Starting: 1,000 users
K = 1.5, ct = 3 days
After 30 days: 1,000 × 1.5^(30/3) = 1,000 × 1.5^10 = 57,665 users
```

**LTV from Referrals:**
```
LTV_referral = (Avg Monthly Volume per User) × (Platform Fee %) × (Referral %) × (Avg Months Active)

Example:
$1,000/mo × 1% × 0.1% × 12 months = $12 LTV per referral
```

---

**End of Viral Loops Document**

**Next Steps:**
1. Prioritize Loop 4 (Referral) for Week 5 implementation
2. Design win graphic templates for Week 6
3. Build leaderboard backend for Week 7
4. Run viral coefficient experiments to validate model assumptions
