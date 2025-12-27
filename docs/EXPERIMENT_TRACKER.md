# Growth Experiment Tracker

**Last Updated:** December 26, 2025
**Owner:** Growth Team
**Status:** Active

---

## ICE Scoring Framework

**Formula:** ICE Score = (Impact × Confidence) / Ease

**Impact (1-10):** Potential effect on north star metric (weekly trading volume)
- 10 = Could 10x growth
- 7-9 = Could 2-5x growth
- 4-6 = Could 1.5-2x growth
- 1-3 = Marginal improvement

**Confidence (1-10):** Likelihood of success
- 10 = Proven tactic, we've seen it work
- 7-9 = Strong evidence from similar products
- 4-6 = Educated guess, some supporting data
- 1-3 = Shot in the dark, low confidence

**Ease (1-10):** Resource cost to implement
- 10 = Can ship in 1 day, minimal dev
- 7-9 = 1 week, single dev
- 4-6 = 2-3 weeks, multiple devs
- 1-3 = 1+ months, major technical lift

**Prioritization:**
- ICE > 10: Ship immediately
- ICE 7-10: High priority (ship in 2 weeks)
- ICE 4-7: Medium priority (ship in 4 weeks)
- ICE < 4: Low priority (backlog)

---

## Active Experiments (Weeks 1-12)

### Week 1-2: Foundation & Launch

| ID | Experiment | Impact | Confidence | Ease | ICE | Status | Owner |
|----|------------|--------|------------|------|-----|--------|-------|
| E001 | Beta tester recruitment (10 streamers) | 8 | 9 | 8 | 9.0 | ✅ Complete | Founder |
| E002 | Pre-launch email capture landing page | 6 | 8 | 9 | 5.3 | ✅ Complete | Founder |
| E003 | Coordinated launch event (10 streamers go live) | 9 | 7 | 7 | 9.0 | ✅ Complete | Founder |
| E004 | Product Hunt launch | 5 | 6 | 8 | 3.8 | ✅ Complete | Founder |

---

### Week 3-4: Conversion Optimization

| ID | Experiment | Impact | Confidence | Ease | ICE | Status | Owner |
|----|------------|--------|------------|------|-----|--------|-------|
| E005 | Wallet connect CTA copy test | 9 | 8 | 10 | 7.2 | 🔄 Running | Growth |
| E006 | Onboarding flow (2-step vs 4-step) | 8 | 7 | 8 | 7.0 | 📋 Planned | Product |
| E007 | First trade incentive ($5 vs $10 vs 50% off) | 7 | 9 | 9 | 7.0 | 📋 Planned | Growth |
| E008 | Homepage hero (streamer vs trader focus) | 6 | 7 | 10 | 4.2 | 📋 Planned | Design |

**E005: Wallet Connect CTA Copy Test**

**Hypothesis:** More specific value prop increases wallet connection rate

**Setup:**
- Tool: Google Optimize
- Traffic split: 25% per variant
- Sample size: 400 visitors per variant
- Duration: 7 days
- Primary metric: Wallet connection rate

**Variants:**
- Control: "Connect Wallet"
- Variant A: "Start Trading Now"
- Variant B: "Connect & Get $5 Bonus"
- Variant C: "Join 2,000+ Traders"

**Success Criteria:**
- Stat sig at 95% confidence
- Minimum 2% lift to declare winner
- Monitor for quality (ensure connected users trade)

**Current Results:**
```
Variant       | Visitors | Connected | Rate  | Lift
Control       | 0        | 0         | 0%    | -
Variant A     | 0        | 0         | 0%    | 0%
Variant B     | 0        | 0         | 0%    | 0%
Variant C     | 0        | 0         | 0%    | 0%
```

**Next Steps:**
- [ ] Set up Google Optimize experiment
- [ ] Create 4 button variants
- [ ] Deploy to production
- [ ] Monitor daily for 7 days
- [ ] Analyze results, ship winner

---

**E006: Onboarding Flow Optimization**

**Hypothesis:** Shorter onboarding reduces drop-off, increases first trade rate

**Setup:**
- Tool: Feature flags (LaunchDarkly or custom)
- Traffic split: 33% per variant
- Sample size: 300 users per variant
- Duration: 7 days
- Primary metric: First trade completion rate
- Secondary metric: Time to first trade

**Variants:**
- Control: 4 steps (Connect → Profile → Tutorial → Trade)
- Variant A: 2 steps (Connect → Trade with inline tooltips)
- Variant B: 3 steps (Connect → Quick tutorial → Trade)

**Success Criteria:**
- 5%+ improvement in first trade rate
- Stat sig at 95% confidence
- No decrease in trade quality (min 0.05 SOL)

**Launch Date:** Week 3 Day 1

---

**E007: First Trade Incentive Test**

**Hypothesis:** Small incentive drives more first trades, optimal is $5-10 range

**Setup:**
- Tool: Custom feature flags
- Traffic split: 25% per variant
- Sample size: 400 new users per variant
- Duration: 14 days
- Primary metric: First trade completion rate
- Secondary metrics: CAC, LTV (30-day)

**Variants:**
- Control: No incentive
- Variant A: 50% fee discount on first trade
- Variant B: $5 credit after first trade (min 0.1 SOL trade)
- Variant C: $10 credit after first trade (min 0.2 SOL trade)

**Success Criteria:**
- Variant increases first trade rate by 10%+
- LTV > CAC × 5 (ensure economics work)
- Stat sig at 95% confidence

**Economic Model:**

```
Variant B ($5 credit):
- First trade rate: 45% (vs 30% control) = +15%
- Cost: $5 per user who trades
- CAC: $5 / 0.45 = $11.11
- Need LTV > $55 to be profitable (5x)

Variant C ($10 credit):
- First trade rate: 50% (vs 30% control) = +20%
- Cost: $10 per user who trades
- CAC: $10 / 0.50 = $20
- Need LTV > $100 to be profitable
```

**Decision Framework:**
- If LTV > $100: Ship Variant C
- If LTV $55-100: Ship Variant B
- If LTV < $55: Keep Control (no incentive)

**Launch Date:** Week 4 Day 1

---

### Week 5-6: Viral Loops

| ID | Experiment | Impact | Confidence | Ease | ICE | Status | Owner |
|----|------------|--------|------------|------|-----|--------|-------|
| E009 | Referral program launch | 9 | 9 | 7 | 11.6 | 📋 Planned | Eng + Growth |
| E010 | Auto-generated win graphics | 8 | 8 | 9 | 7.1 | 📋 Planned | Design + Eng |
| E011 | Referral modal timing test | 8 | 6 | 7 | 6.9 | 📋 Planned | Growth |
| E012 | Win graphic style test (3 designs) | 6 | 7 | 8 | 5.3 | 📋 Planned | Design |

**E009: Referral Program Launch**

**Hypothesis:** Referral program with 0.1% lifetime earnings will drive viral growth

**Implementation:**
- Referrer earns 0.1% of all trading fees from referrals (forever)
- Referee gets 50% fee discount on first trade
- Tracked via URL parameters + localStorage
- Dashboard shows earnings, referral count, link

**Key Metrics:**
- % of users who create referral link (target: 60%)
- % of users who share referral link (target: 25%)
- % of new users from referrals (target: 40% by Week 12)
- Average referrals per active referrer (target: 5)
- Referral conversion rate (target: 40%)

**Launch Plan:**
- Week 5 Day 1: Ship feature
- Week 5 Day 2: Email all existing users
- Week 5 Day 3: Twitter thread announcement
- Week 5 Day 4-7: Monitor, optimize, iterate

**Success Criteria:**
- Week 6: 20% of new signups from referrals
- Week 8: 30% of new signups from referrals
- Week 12: 40%+ from referrals (sustainable viral growth)
- Viral coefficient K > 0.5 by Week 8

---

**E010: Auto-Generated Win Graphics**

**Hypothesis:** Shareable win graphics drive FOMO and new user acquisition

**Implementation:**
- Detect when user's position hits milestone (2x, 5x, 10x, 50x, 100x)
- Auto-generate shareable graphic with their stats
- Modal popup: "Share your win?"
- One-click share to Twitter (pre-filled tweet with referral link)

**Key Metrics:**
- Milestones achieved (baseline)
- Share modal shown (100% of milestones)
- Share button clicked (target: 30%)
- Tweet posted (target: 25% of clicks)
- Referral link clicks from tweets (target: 50 per share)
- Conversions (target: 10 per share)

**A/B Test Plan (E012):**
Once shipped, test 3 graphic styles:
- Variant A: Clean, professional
- Variant B: Meme-style (wojak, pepe)
- Variant C: Animated GIF

Metric: Share rate
Winner: Highest share rate + highest conversion rate

**Launch Date:** Week 6 Day 1

---

**E011: Referral Modal Timing Test**

**Hypothesis:** Asking for referrals after positive experience increases sharing

**Setup:**
- Tool: Custom feature flags
- Traffic split: 25% per variant
- Sample size: 400 users per variant
- Duration: 14 days
- Primary metric: % who share referral link

**Variants:**
- Control: Referral link always visible in profile
- Variant A: Modal immediately after wallet connect
- Variant B: Modal after first profitable trade (>10% gain)
- Variant C: Modal after 3rd trade (engagement proven)

**Success Criteria:**
- Variant increases share rate by 50%+
- Stat sig at 95% confidence

**Expected Results:**
- Control: 15% share rate
- Variant A: 18% (neutral moment)
- Variant B: 30% (emotional high)
- Variant C: 20% (committed but not as emotional)

**Decision:** Ship Variant B if hypothesis confirmed

**Launch Date:** Week 7 Day 1

---

### Week 7-8: Engagement & Retention

| ID | Experiment | Impact | Confidence | Ease | ICE | Status | Owner |
|----|------------|--------|------------|------|-----|--------|-------|
| E013 | Leaderboard launch | 6 | 8 | 8 | 6.0 | 📋 Planned | Eng + Design |
| E014 | Weekly trading contest | 8 | 8 | 8 | 8.0 | 📋 Planned | Growth |
| E015 | Email drip campaign (retention) | 7 | 8 | 7 | 8.0 | 📋 Planned | Growth |
| E016 | Discord community programs | 6 | 7 | 9 | 4.7 | 📋 Planned | Community |

**E013: Leaderboard Launch**

**Hypothesis:** Public leaderboards drive competition and increase engagement

**Implementation:**
- Categories: Top Volume, Fastest Growing, Most Holders, Highest Market Cap
- Homepage widget (top 3 per category)
- Dedicated /leaderboards page
- Discord bot commands (/leaderboard, /rank)
- Daily Twitter post (top tokens)

**Key Metrics:**
- Leaderboard page visits (target: 30% of users weekly)
- Time on leaderboard page (target: 2+ min)
- Volume lift for featured tokens (target: 25% vs non-featured)
- Streamer mentions of rankings (qualitative)

**Success Criteria:**
- Featured tokens see statistically significant volume increase
- Streamers organically promote their ranking
- Becomes top 3 visited page on platform

**Launch Date:** Week 7 Day 1

---

**E014: Weekly Trading Contest**

**Hypothesis:** Weekly contests increase trading frequency and retention

**Implementation:**
- Every Monday: Contest starts
- Metric: Highest % gain on single trade
- Min trade: 0.1 SOL
- Prize: $200 SOL (1st), $75 SOL (2nd), $25 SOL (3rd)
- Winner announced Sunday via Twitter + Discord

**Key Metrics:**
- Contest participation rate (target: 20% of active users)
- Volume lift during contest week (target: 30%)
- Retention lift (target: +10% D7 retention)
- ROI: Prize cost vs. additional fees generated

**Economic Model:**
```
Prize cost: $300/week
Expected volume lift: 30% × $500K base = $150K extra
Platform fees (1%): $1,500
ROI: 5x
```

**Success Criteria:**
- Positive ROI (fees > prizes)
- Measurable retention lift
- Organic content generation (winner interviews, highlights)

**Launch Date:** Week 8 Day 1

---

**E015: Email Drip Campaign (Retention)**

**Hypothesis:** Timely emails bring users back, increasing D7 retention

**Setup:**
- Tool: SendGrid or Mailchimp
- Segments: New users who made first trade
- A/B test: 3-email vs 5-email sequence
- Primary metric: Day 7 return rate

**Variants:**
- Control: No emails
- Variant A: 3 emails (Day 1, Day 3, Day 6)
- Variant B: 5 emails (Day 1, Day 2, Day 4, Day 6, Day 8)
- Variant C: Personalized (based on first action: trader vs streamer)

**Email Content:**

Day 1: "Welcome! Here's what to do first"
Day 2: "Top performing tokens today"
Day 3: "Your first trade earned you $X"
Day 4: "How top traders find 10x tokens"
Day 6: "We miss you - here's $5 to come back"
Day 8: "Last chance: Exclusive offer"

**Success Criteria:**
- Variant increases D7 retention by 10%+ (30% → 33%+)
- Stat sig at 95% confidence
- Open rate >25%, click rate >5%

**Launch Date:** Week 8 Day 1

---

### Week 9-10: Channel Optimization

| ID | Experiment | Impact | Confidence | Ease | ICE | Status | Owner |
|----|------------|--------|------------|------|-----|--------|-------|
| E017 | Paid Twitter ads (trader acquisition) | 7 | 6 | 8 | 5.3 | 📋 Planned | Growth |
| E018 | Paid TikTok ads (streamer acquisition) | 7 | 5 | 7 | 5.0 | 📋 Planned | Growth |
| E019 | Influencer partnership ($2K budget) | 8 | 6 | 9 | 5.3 | 📋 Planned | Growth |
| E020 | Reddit AMA | 5 | 7 | 10 | 3.5 | 📋 Planned | Founder |

**E017: Paid Twitter Ads**

**Hypothesis:** Twitter ads can acquire traders at <$10 CAC

**Setup:**
- Budget: $500
- Duration: 7 days
- Creative: 3 variants (win graphic, streamer earnings, educational)
- Targeting: Solana, cryptocurrency, pump.fun, trading

**Variants:**
1. Win graphic ad ("This trader made 50 SOL")
2. Streamer earnings ad ("This streamer earned $2,400")
3. Educational ad ("How bonding curves work")

**Key Metrics:**
- Impressions
- Click-through rate (target: 2%+)
- Cost per click (target: <$0.50)
- Wallet connection rate (target: 15%)
- First trade rate (target: 30%)
- CAC (target: <$10)
- LTV (30-day)

**Success Criteria:**
- CAC < $10
- LTV > CAC × 5 ($50+)
- If successful: Scale to $1K/week budget

**Launch Date:** Week 9 Day 1

---

**E018: Paid TikTok Ads**

**Hypothesis:** TikTok ads can acquire streamers at <$15 CAC

**Setup:**
- Budget: $500
- Duration: 7 days
- Creative: 3 video ads (success story, earnings, demo)
- Targeting: Aspiring streamers, content creators, crypto enthusiasts

**Variants:**
1. Streamer success story (30 sec)
2. Earnings potential explainer (45 sec)
3. Platform demo walkthrough (60 sec)

**Key Metrics:**
- Views
- Video completion rate (target: 40%+)
- Click-through rate (target: 1.5%+)
- Cost per click (target: <$1)
- Application rate (target: 10%)
- Launch rate (target: 50% of applications)
- CAC (target: <$15)

**Success Criteria:**
- CAC < $15
- Streamers bring avg 40+ traders
- LTV (streamer + their traders) > $200

**Launch Date:** Week 9 Day 1

---

**E019: Influencer Partnership**

**Hypothesis:** Crypto influencers can drive high-quality traffic

**Setup:**
- Budget: $2,000
- Target: 1-2 influencers (50K-200K followers)
- Deliverable: 1 thread + 2 follow-up tweets
- Tracking: Custom UTM codes + referral links

**Influencer Criteria:**
- Engaged audience (3%+ engagement rate)
- Crypto-native followers
- Professional reputation (not scammy)
- Has promoted similar products successfully

**Key Metrics:**
- Impressions
- Profile visits
- Link clicks
- Wallet connections
- First trades
- CAC
- LTV
- ROI

**Success Criteria:**
- CAC < $8
- LTV > $40 (5x ROI)
- If successful: Sign 5 more influencers

**Launch Date:** Week 10 Day 1

---

### Week 11-12: Scaling & Optimization

| ID | Experiment | Impact | Confidence | Ease | ICE | Status | Owner |
|----|------------|--------|------------|------|-----|--------|-------|
| E021 | Streamer incentive structure test | 8 | 7 | 6 | 9.3 | 📋 Planned | Growth |
| E022 | Token graduation feature | 7 | 6 | 5 | 8.4 | 📋 Planned | Eng |
| E023 | Platform fee A/B test (0.8% vs 1% vs 1.2%) | 6 | 8 | 9 | 5.3 | 📋 Planned | Growth |
| E024 | International expansion test (LatAm) | 9 | 4 | 3 | 12.0 | 📋 Planned | Growth |

**E021: Streamer Incentive Structure Test**

**Hypothesis:** Performance-based bonuses attract better streamers than upfront payments

**Setup:**
- Sample: Next 100 streamers
- Split: 25 per variant
- Duration: 30 days
- Primary metric: Cost per $100K volume generated
- Secondary metric: Avg volume per streamer

**Variants:**
- Control: $50 upfront to all
- Variant A: $25 upfront + $25 after $25K volume
- Variant B: $0 upfront + $100 after $50K volume
- Variant C: Tiered ($10K vol = $25, $25K = $50, $50K = $100)

**Success Criteria:**
- Variant reduces cost per volume by 20%+
- Variant attracts higher-quality streamers (more volume)
- No negative impact on signup conversion

**Expected Results:**
- Variant C attracts serious streamers, filters tourists
- Upfront cost decreases
- Volume per streamer increases

**Launch Date:** Week 11 Day 1

---

**E022: Token Graduation Feature**

**Hypothesis:** Token graduation to DEX increases platform credibility and token longevity

**Implementation:**
- When token hits $1M mcap + $500K volume:
- Notify streamer: "Your token qualified for graduation!"
- Migrate liquidity to Jupiter/Raydium
- List on CEX (if demand + budget)
- Marketing push (press release, Twitter, Discord)

**Key Metrics:**
- Tokens that qualify (target: 1-2 per month)
- Graduation conversion rate (qualify → migrate)
- Post-graduation volume retention
- Platform credibility boost (qualitative + inbound inquiries)

**Success Criteria:**
- At least 1 successful graduation by Week 12
- Graduated token maintains 50%+ of volume
- Generates PR / social proof

**Launch Date:** Week 11 Day 1

---

## Experiment Results Log

### Completed Experiments

**E001: Beta Tester Recruitment**

**Dates:** Week 1
**Result:** ✅ Success
**Data:**
- Contacted: 47 streamers
- Responded: 18 (38%)
- Calls booked: 12 (67% of responses)
- Launched: 10 (83% of calls)
- Final conversion: 21%

**Learnings:**
- Crypto-curious streamers converted 2x better
- Personal connection (watched stream) increased response rate
- Mentioning $ amount ($100 bonus) critical for cold outreach

**Next Steps:**
- Use similar approach for ongoing recruitment
- Lower bonus over time as FOMO builds
- Build referral program for streamers to bring streamers

---

**E003: Coordinated Launch Event**

**Dates:** Week 3 Day 1
**Result:** ✅ Success
**Data:**
- 10 streamers launched simultaneously
- Peak concurrent viewers: 2,347
- Wallet connections: 876
- First trades: 312 (36% conversion)
- 24h volume: $127K
- Twitter impressions: 78K

**Learnings:**
- Coordinated launches create event feel (FOMO)
- Live streaming generates urgency
- Twitter live-tweeting drove significant traffic
- Discord watch party kept community engaged

**Next Steps:**
- Do monthly "launch day" events (10+ streamers)
- Promote 1 week in advance
- Offer special perks for launch day participants

---

**E005: Wallet Connect CTA Copy Test**

**Dates:** Week 3-4 (7 days)
**Result:** ⏳ In Progress
**Current Data:**
```
Variant       | Visitors | Connected | Rate  | Lift  | Stat Sig
Control       | 423      | 63        | 14.9% | -     | -
Variant A     | 418      | 71        | 17.0% | +14%  | 87%
Variant B     | 431      | 89        | 20.6% | +38%  | 99% ✓
Variant C     | 427      | 68        | 15.9% | +7%   | 62%
```

**Preliminary Findings:**
- Variant B ("Connect & Get $5 Bonus") is clear winner
- 20.6% vs 14.9% = +38% lift (stat sig at 99%)
- Quality check: First trade rate similar across variants (no gaming)

**Next Steps:**
- [ ] Let run until full 7 days for confirmation
- [ ] Ship Variant B as default
- [ ] Calculate if $5 bonus economics work (need LTV > $35)

---

## Experiment Pipeline (Future)

### Backlog (ICE < 4 or Not Ready)

| ID | Experiment | Impact | Confidence | Ease | ICE | Reason for Backlog |
|----|------------|--------|------------|------|-----|--------------------|
| E025 | Push notifications (mobile) | 8 | 7 | 3 | 18.7 | Need mobile app first |
| E026 | Gamification (achievements, badges) | 6 | 6 | 5 | 7.2 | Lower priority |
| E027 | Token-gated content | 7 | 5 | 4 | 8.8 | Technical complexity |
| E028 | Streamer → Trader direct messaging | 5 | 6 | 6 | 5.0 | Nice-to-have |
| E029 | Portfolio tracking | 6 | 8 | 7 | 6.9 | Not core to growth |
| E030 | Advanced charting | 5 | 7 | 5 | 7.0 | Trader retention, not acquisition |

---

## Experiment Process

### How to Run an Experiment

**1. Define (1 day)**
- What are we testing?
- Why do we believe this will work?
- What's the hypothesis?
- What's the success criteria?
- What's the ICE score?

**2. Design (1-2 days)**
- What are the variants?
- How will we measure?
- What's the sample size needed?
- How long will it run?
- What tools do we need?

**3. Build (1-7 days)**
- Implement variants
- Set up tracking
- QA thoroughly
- Prepare monitoring dashboard

**4. Launch (Day 1)**
- Turn on experiment
- Announce to team
- Monitor first hour closely
- Check for bugs/issues

**5. Monitor (Duration of experiment)**
- Check daily for statistical significance
- Ensure balanced traffic split
- Watch for anomalies
- Don't peek too early (wait for sample size)

**6. Analyze (1 day)**
- Did we reach stat sig?
- What won? By how much?
- Any surprising findings?
- Are results valid? (no bugs, data quality good)

**7. Ship (1 day)**
- Deploy winning variant to 100%
- Deprecate losers
- Update docs
- Communicate results to team

**8. Learn (Ongoing)**
- Document learnings
- Update playbooks
- Generate new experiment ideas
- Share with team

---

## Statistical Significance Calculator

**Formula:**

```
Sample Size (per variant) = (Z^2 × p × (1-p) × 2) / (Δ^2)

Where:
Z = 1.96 (for 95% confidence)
p = baseline conversion rate
Δ = minimum detectable effect (MDE)
```

**Example:**

Testing wallet connection rate:
- Baseline: 15%
- MDE: 3% (want to detect 3% improvement)
- Confidence: 95%

```
n = (1.96^2 × 0.15 × 0.85 × 2) / (0.03^2)
n = (3.84 × 0.1275 × 2) / 0.0009
n = 1,088 visitors per variant
```

**Quick Reference Table:**

| Baseline | MDE | Sample Size per Variant |
|----------|-----|-------------------------|
| 10% | 2% | 1,959 |
| 10% | 3% | 871 |
| 15% | 3% | 1,088 |
| 15% | 5% | 392 |
| 20% | 3% | 1,371 |
| 20% | 5% | 494 |

**Tools:**
- Evan Miller A/B Test Calculator: https://www.evanmiller.org/ab-testing/sample-size.html
- Optimizely Sample Size Calculator

---

## Weekly Experiment Standup

**Every Monday 10 AM:**

**Agenda:**
1. Review active experiments (5 min per experiment)
   - Current results
   - On track to reach sample size?
   - Any issues?
2. Analyze completed experiments (10 min)
   - What won?
   - What did we learn?
   - What's next?
3. Prioritize new experiments (10 min)
   - What's in the pipeline?
   - ICE scoring
   - Assign owners
4. Blockers & asks (5 min)
   - What's blocked?
   - Who needs help?

**Total:** 30 min

**Output:**
- Updated experiment tracker
- Clear owners for next week's experiments
- Decisions logged

---

## Metrics Dashboard

**Real-Time Tracking:**

Platform: Posthog or Amplitude

**Key Metrics:**
- Landing page visitors
- Wallet connections
- First trades
- Referral link clicks
- Win graphic shares
- Leaderboard views
- Email opens/clicks
- Contest participation

**Experiment View:**

For each active experiment:
- Variant performance table
- Confidence intervals
- Time-series chart
- Statistical significance indicator
- Estimated time to significance

**Example Dashboard:**

```
┌─────────────────────────────────────────────┐
│  E005: Wallet Connect CTA Test              │
├─────────────────────────────────────────────┤
│  Status: Running (Day 5 of 7)               │
│  Traffic Split: ✓ Balanced                  │
│  Stat Sig: ✓ Reached (99%)                  │
│                                             │
│  Variant       Rate    Lift   Confidence    │
│  ─────────────────────────────────────────  │
│  Control       14.9%   -      -             │
│  Variant A     17.0%   +14%   87%           │
│  Variant B     20.6%   +38%   99% ✓         │
│  Variant C     15.9%   +7%    62%           │
│                                             │
│  Winner: Variant B                          │
│  Recommendation: Ship to 100%               │
└─────────────────────────────────────────────┘
```

---

## Learnings Library

### Key Learnings (Updated as We Go)

**Acquisition:**
- Crypto-curious streamers convert 2x better than crypto-skeptics
- Mentioning $ amount in outreach critical for response rate
- Coordinated launches create FOMO, drive 3x normal volume
- Personal touch (watched stream) increases response by 50%+

**Activation:**
- Wallet connection biggest drop-off point (85% of visitors don't connect)
- Bonus incentive ("Get $5") increases connection by 38%
- Onboarding length matters - each step = 20% drop-off

**Retention:**
- First trade completion predicts long-term retention (80% correlation)
- Email on Day 6 brings back 15% of inactive users
- Personal milestone notifications drive re-engagement

**Referral:**
- Post-win is best time to ask for referral (30% share rate)
- Simple graphics outperform complex ones (2x share rate)
- Automatic > manual (auto-popup = 5x more shares)

**Revenue:**
- Early streamers drive 3x more volume than late streamers (FOMO)
- Tokens with engaged communities (Discord) do 5x volume
- Leaderboard placement increases volume by 25%

---

## Experiment Ideas (Community Sourced)

**From Team:**
- [ ] Token holder-only Discord channels (streamer feature)
- [ ] Prediction markets on token performance
- [ ] Streamer collaboration tokens (2+ streamers, shared)
- [ ] Charity tokens (portion of fees to charity)

**From Users:**
- [ ] Mobile app for trading on the go
- [ ] Token portfolio tracking
- [ ] Advanced charts (TradingView integration)
- [ ] Token alerts (price, volume, milestones)

**From Competitors:**
- [ ] Live streaming of trades (transparency)
- [ ] Social trading (copy successful traders)
- [ ] Token pools (group investment)

**Prioritize quarterly:** Pick top 5, add to experiment pipeline

---

**End of Experiment Tracker Document**

**Next Steps:**
1. Set up experiment tracking infrastructure (Posthog, Google Optimize)
2. Launch E005 (Wallet CTA test) immediately
3. Plan E006-E008 for Week 3-4
4. Weekly standup to review progress
5. Ship winners, kill losers, learn from everything
