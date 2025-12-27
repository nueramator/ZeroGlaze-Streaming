# Zeroglaze Feature Prioritization & RICE Scoring

**Purpose**: Prioritize features using RICE framework to ensure we build the right things in the right order.

---

## RICE Framework Reminder

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many users affected? (number per quarter)
- **Impact**: How much value per user? (3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal)
- **Confidence**: How certain are we? (100%=High, 80%=Medium, 50%=Low)
- **Effort**: Person-days to implement (1-20 scale)

---

## MVP Features (Must Ship in 6 Days)

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| Wallet Connection (Phantom) | 100 | 3 | 100% | 0.5 | **600** | P0 |
| Token Creation (SPL) | 100 | 3 | 100% | 2 | **150** | P0 |
| Buy/Sell Trading | 100 | 3 | 80% | 2 | **120** | P0 |
| Linear Bonding Curve | 100 | 2 | 100% | 1 | **200** | P0 |
| Fee Distribution (1%+2%/0.2%) | 100 | 2.5 | 100% | 1.5 | **167** | P0 |
| Twitch Stream Verification | 100 | 2 | 80% | 1.5 | **107** | P0 |
| Token Discovery Page | 100 | 2 | 100% | 1 | **200** | P0 |
| Real-time Price Updates | 100 | 2 | 80% | 1 | **160** | P0 |
| Live/Offline Indicator | 100 | 1.5 | 100% | 0.5 | **300** | P0 |
| Basic Price Chart (Chart.js) | 100 | 1.5 | 100% | 0.5 | **300** | P1 |
| Mobile Responsive Design | 100 | 2 | 100% | 0.75 | **267** | P1 |
| One Token Per Wallet Check | 100 | 1 | 100% | 0.25 | **400** | P1 |
| Trade History Display | 100 | 1 | 100% | 0.5 | **200** | P1 |

**P0 = Critical Path** (blocks launch)
**P1 = High Priority** (needed for good UX but can ship without)

---

## Features Cut from MVP (Added to V1)

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Why Cut? |
|---------|-------|--------|------------|--------|------------|----------|
| Constant Product Bonding Curve | 100 | 3 | 70% | 3 | **70** | Too complex for 6 days. Linear curve proves concept. |
| Token Graduation to DEX | 50 | 3 | 60% | 4 | **22.5** | Requires liquidity migration, adds 2+ days. Not essential for MVP. |
| TradingView Charts | 100 | 2 | 80% | 2 | **80** | Chart.js gives 80% of value in 25% of time. |
| Stream Overlay Widget | 30 | 2.5 | 50% | 3 | **12.5** | Requires OBS plugin development. Complex and low reach initially. |
| Creator Token Freeze (enforced) | 100 | 1.5 | 70% | 1.5 | **70** | Can show badge without smart contract enforcement for MVP. |
| Multiple Platform Support | 150 | 2 | 50% | 4 | **37.5** | Each platform adds 1+ day. Twitch first validates concept. |
| Advanced Search/Filters | 100 | 1 | 100% | 1 | **100** | Basic discovery is enough. Advanced filters can wait. |
| Portfolio Page | 100 | 1.5 | 100% | 1 | **150** | Nice to have but not essential for MVP launch. |
| Transaction History Page | 100 | 1 | 100% | 0.75 | **133** | Recent trades feed is enough for MVP. |
| Notifications System | 100 | 1.5 | 80% | 1.5 | **80** | Adds complexity. Manual refresh acceptable for MVP. |

---

## Value vs Effort Matrix

### Quick Wins (High Value, Low Effort) - DO FIRST
```
                High Value
                    ↑
    ┌───────────────┼───────────────┐
    │  Trade Later  │  QUICK WINS   │
    │               │ • Wallet      │
    │               │ • Live Dot    │
    │               │ • 1 Token Chk │
    │               │ • Chart.js    │
    ├───────────────┼───────────────┤
    │  Don't Do     │  Trade Later  │
    │               │               │
    │               │               │
Low │               │               │ High
Effort              │             Effort
    └───────────────┼───────────────┘
                Low Value
```

### Big Bets (High Value, High Effort) - PLAN CAREFULLY
```
                High Value
                    ↑
    ┌───────────────┼───────────────┐
    │               │   BIG BETS    │
    │               │ • Token Create│
    │               │ • Buy/Sell    │
    │               │ • Bonding Crv │
    │               │ • Fee Distrib │
    │               │ • Twitch API  │
    ├───────────────┼───────────────┤
                    │
                    │
                    │
                    │
    └───────────────┼───────────────┘
```

---

## Day-by-Day Prioritization

### Day 1: Foundation (Priority: Infrastructure)
**Philosophy**: Can't build anything without foundation
1. Wallet connection (RICE: 600) - Quick win
2. Database setup (RICE: N/A but essential)
3. UI shell (RICE: N/A but essential)

**Why this order**: Wallet blocks all blockchain features. Database blocks all data storage. UI shell blocks all interface work.

---

### Day 2: Token Creation (Priority: Core Value Prop)
**Philosophy**: Token creation is the primary value proposition
1. SPL token creation (RICE: 150) - Big bet
2. Token creation UI (RICE: 150) - Big bet
3. Database integration (RICE: N/A but essential)

**Why this order**: Smart contract must work before UI. UI must work before database can store tokens.

---

### Day 3: Trading (Priority: Revenue Generation)
**Philosophy**: Trading generates fees = revenue
1. Linear bonding curve (RICE: 200) - Big bet
2. Buy/sell logic (RICE: 120) - Big bet
3. Fee distribution (RICE: 167) - Big bet
4. Trading UI (RICE: 120) - Big bet

**Why this order**: Bonding curve defines pricing. Buy/sell uses pricing. Fees are part of buy/sell. UI comes last.

---

### Day 4: Stream Integration (Priority: Differentiation)
**Philosophy**: Stream-linked fees are our unique value
1. Twitch API (RICE: 107) - Big bet
2. Real-time updates (RICE: 160) - Big bet
3. Live/offline indicator (RICE: 300) - Quick win
4. Dynamic fee adjustment (RICE: N/A but essential)

**Why this order**: Twitch API is the foundation. Real-time updates enhance UX. Live dot is visual feedback. Fees tie it together.

---

### Day 5: Discovery & Polish (Priority: Usability)
**Philosophy**: Users need to find and use the product
1. Token discovery (RICE: 200) - Big bet
2. Basic charts (RICE: 300) - Quick win
3. Mobile responsive (RICE: 267) - Quick win
4. UI polish (RICE: N/A but essential)

**Why this order**: Discovery enables user acquisition. Charts improve decision-making. Mobile expands reach. Polish improves retention.

---

### Day 6: Launch Prep (Priority: Quality)
**Philosophy**: Can't launch with critical bugs
1. End-to-end testing (RICE: N/A but essential)
2. Bug fixes (RICE: N/A but essential)
3. Deployment (RICE: N/A but essential)

**Why this order**: Test first to find bugs. Fix bugs before deploy. Deploy last when everything works.

---

## Scope Management: What Can We Cut?

### If Day 1 falls behind:
**Cut**: UI polish, seed data
**Impact**: Minimal - can add later
**Time Saved**: 2 hours

### If Day 2 falls behind:
**Cut**: Image upload (use placeholder images)
**Impact**: Low - can add in V1
**Time Saved**: 1 hour

### If Day 3 falls behind:
**Cut**: "Max" button, detailed fee breakdown
**Impact**: Low - users can manually enter max
**Time Saved**: 1 hour

### If Day 4 falls behind:
**Cut**: Real-time updates (use 10s polling), notifications
**Impact**: Medium - UX slightly worse
**Time Saved**: 3 hours

### If Day 5 falls behind:
**Cut**: Charts (skip entirely), advanced filters
**Impact**: Medium - can add in V1
**Time Saved**: 4 hours

### If Day 6 falls behind:
**Cut**: Nothing - must test and deploy
**Impact**: N/A - launch date is hard deadline
**Time Saved**: 0

---

## Trade-off Decision Framework

When faced with a decision during the sprint, use this framework:

### Question 1: Does it block core user flow?
- **Yes** → Must do (P0)
- **No** → Maybe (continue to Q2)

### Question 2: Does it differentiate us from competitors?
- **Yes** → High priority (P1)
- **No** → Maybe (continue to Q3)

### Question 3: Can users achieve their goal without it?
- **Yes** → Low priority (P2 or V1)
- **No** → Medium priority (P1)

### Question 4: How long will it take?
- **< 2 hours** → Do it (quick win)
- **2-4 hours** → Consider (evaluate value)
- **> 4 hours** → Defer to V1 (unless P0)

### Example Decision Tree:

**Feature**: Advanced chart with volume bars

1. Does it block core user flow? **No** (basic chart works)
2. Does it differentiate us? **No** (many have charts)
3. Can users trade without it? **Yes**
4. How long? **4 hours**

**Decision**: Defer to V1 ✅

---

**Feature**: Token creation

1. Does it block core user flow? **Yes** (can't trade without tokens)

**Decision**: Must do (P0) ✅

---

**Feature**: Live/offline indicator

1. Does it block core user flow? **No**
2. Does it differentiate us? **Yes** (unique to our platform)
3. How long? **30 minutes**

**Decision**: Do it (P1 quick win) ✅

---

## Velocity Tracking

Track daily progress to adjust scope:

| Day | Planned Hours | Actual Hours | Velocity | Adjustment Needed? |
|-----|---------------|--------------|----------|-------------------|
| 1 | 10 | TBD | TBD | TBD |
| 2 | 10 | TBD | TBD | TBD |
| 3 | 10 | TBD | TBD | TBD |
| 4 | 10 | TBD | TBD | TBD |
| 5 | 10 | TBD | TBD | TBD |
| 6 | 10 | TBD | TBD | TBD |

**Velocity Formula**: Actual Hours / Planned Hours
- **> 1.0** = Behind schedule (cut scope)
- **0.8-1.0** = On track (no change)
- **< 0.8** = Ahead of schedule (add features)

---

## Feature Confidence Scores

How confident are we in our effort estimates?

| Feature | Confidence | Risk | Mitigation |
|---------|-----------|------|------------|
| Wallet Connection | 100% | None | Done this before |
| Token Creation | 80% | Smart contract bugs | Use Anchor boilerplate |
| Bonding Curve | 70% | Math errors | Test thoroughly |
| Trading Logic | 80% | Transaction failures | Add retry logic |
| Twitch API | 60% | Rate limits, API changes | Use conservative polling |
| Real-time Updates | 70% | Supabase limits | Fall back to polling |
| Charts | 90% | Chart.js config | Use examples |
| Mobile Responsive | 90% | CSS bugs | Use Tailwind |

**High Risk** (< 70% confidence):
- Twitch API: Build manual toggle as backup
- Bonding Curve: Start with extra simple linear formula

---

## V1 Backlog (Post-MVP)

Prioritized features for weeks 2-4:

### Week 2 Focus: Bonding Curve Upgrade
1. Constant product AMM (RICE: 70)
2. Graduation mechanism (RICE: 22.5)
3. Liquidity migration (RICE: 22.5)

**Rationale**: Improves tokenomics, attracts serious traders

### Week 3 Focus: UX Enhancements
1. TradingView charts (RICE: 80)
2. Portfolio page (RICE: 150)
3. Transaction history (RICE: 133)
4. Notifications (RICE: 80)

**Rationale**: Improves retention, reduces churn

### Week 4 Focus: Creator Tools
1. Token freeze enforcement (RICE: 70)
2. Creator dashboard (RICE: 60)
3. Stream overlay widget (RICE: 12.5)
4. Verified badges (RICE: 40)

**Rationale**: Attracts quality creators, builds trust

---

## Success Metrics by Priority

### P0 Metrics (Must Hit)
- [ ] Token creation success rate: > 95%
- [ ] Trade execution success rate: > 95%
- [ ] Wallet connection success rate: > 98%
- [ ] App loads without errors: 100%

### P1 Metrics (Should Hit)
- [ ] Mobile responsive (no horizontal scroll): 100%
- [ ] Page load time: < 3s
- [ ] Real-time update latency: < 5s
- [ ] Stream status accuracy: > 95%

### P2 Metrics (Nice to Have)
- [ ] Chart load time: < 2s
- [ ] Search results: < 1s
- [ ] Image load time: < 2s

---

## Final Prioritization Summary

**Do First** (Day 1-3):
1. Wallet connection
2. Token creation
3. Buy/sell trading
4. Bonding curve
5. Fee distribution

**Do Second** (Day 4):
1. Twitch integration
2. Real-time updates
3. Live/offline indicator
4. Dynamic fees

**Do Third** (Day 5):
1. Token discovery
2. Basic charts
3. Mobile responsive

**Do Last** (Day 6):
1. Testing
2. Bug fixes
3. Deployment

**Don't Do** (Defer to V1):
1. Constant product curve
2. Token graduation
3. TradingView charts
4. Stream overlay
5. Multiple platforms
6. Advanced features

---

**Key Insight**: We're shipping 80% of the value in 20% of the time by focusing on core user flows and deferring polish and advanced features to V1.

**Success = Working product that demonstrates value, not perfect product.**

---

**Last Updated**: December 26, 2024
**Status**: Ready for execution
