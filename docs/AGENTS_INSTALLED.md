# AI Agents Installed for Zeroglaze

Successfully installed 10 specialized AI agents from the [Contains Studio framework](https://github.com/contains-studio/agents), customized specifically for your Zeroglaze Web3 streaming + tokenomics platform.

## Installation Summary

**Location:** `~/.claude/agents/`
**Total Agents:** 10
**Status:** ✅ Ready to use

## Quick Start

Simply describe what you need in natural language, and the relevant agent will automatically activate. For example:

- "Design the bonding curve smart contract" → **backend-architect** activates
- "Create the trading UI component" → **frontend-developer** activates
- "Plan our next 6-day sprint" → **sprint-prioritizer** activates
- "Set up CI/CD for Solana deployment" → **devops-automator** activates

## Installed Agents by Category

### 🔧 Engineering (6 agents)

| Agent | Use When | Key Capabilities |
|-------|----------|------------------|
| **backend-architect** | Designing APIs, smart contracts, databases | Solana programs, bonding curves, fee distribution, Supabase schemas |
| **frontend-developer** | Building React/Next.js UIs | Wallet integration, trading interfaces, real-time updates, charts |
| **ai-engineer** | Adding ML/AI features | Recommendation systems, personalization, content moderation |
| **test-writer-fixer** | Writing/fixing tests | Smart contract tests, API tests, E2E tests, blockchain testing |
| **rapid-prototyper** | Fast MVP development | Quick scaffolding, leveraging pre-built tools, 6-day shipping |
| **devops-automator** | CI/CD, infrastructure, deployment | GitHub Actions, Vercel, Solana deployment, monitoring setup |

### 🎨 Design (1 agent)

| Agent | Use When | Key Capabilities |
|-------|----------|------------------|
| **ui-designer** | Designing interfaces, components | Trading UIs, Tailwind CSS, mobile-first, crypto design patterns |

### 📊 Product (1 agent)

| Agent | Use When | Key Capabilities |
|-------|----------|------------------|
| **sprint-prioritizer** | Planning sprints, prioritizing features | RICE scoring, roadmap planning, trade-off decisions |

### 🚀 Project Management (1 agent)

| Agent | Use When | Key Capabilities |
|-------|----------|------------------|
| **project-shipper** | Coordinating launches, releases | Go-to-market strategy, launch coordination, stakeholder communication |

### 📈 Marketing (1 agent)

| Agent | Use When | Key Capabilities |
|-------|----------|------------------|
| **growth-hacker** | User acquisition, growth experiments | Crypto Twitter tactics, viral loops, referral programs, Discord growth |

## Example Usage Scenarios

### Scenario 1: Building the Token Creation Flow

**You:** "I need to build the complete token creation flow for streamers"

**Agents that activate:**
1. **backend-architect** → Designs the smart contract and API endpoints
2. **frontend-developer** → Builds the multi-step creation wizard UI
3. **ui-designer** → Creates the visual design and user flow
4. **test-writer-fixer** → Writes comprehensive tests for the flow

### Scenario 2: Launching the MVP

**You:** "We're ready to launch our MVP next week. Help me coordinate."

**Agents that activate:**
1. **sprint-prioritizer** → Finalizes scope and priorities
2. **project-shipper** → Creates launch timeline and checklist
3. **growth-hacker** → Develops acquisition strategy (Twitter, Discord, outreach)
4. **devops-automator** → Ensures monitoring and deployment are ready

### Scenario 3: Optimizing Trading Performance

**You:** "The trading interface feels slow. How can we optimize it?"

**Agents that activate:**
1. **frontend-developer** → Optimizes React re-renders, implements code splitting
2. **backend-architect** → Reviews API response times, adds caching
3. **devops-automator** → Sets up performance monitoring, CDN optimization
4. **test-writer-fixer** → Adds performance benchmarks

## Recommended Development Flow

### Week 1-2: Foundation
```
rapid-prototyper → Quick project setup
backend-architect → Smart contract design
devops-automator → CI/CD pipeline setup
```

### Week 3-4: Core Features
```
frontend-developer → Trading UI components
ui-designer → Professional trading interface design
backend-architect → API endpoints and bonding curve logic
test-writer-fixer → Comprehensive test coverage
```

### Week 5-6: Launch Preparation
```
sprint-prioritizer → Final sprint planning
project-shipper → Launch coordination
growth-hacker → Acquisition campaign setup
devops-automator → Production deployment
```

### Week 7+: Growth & Iteration
```
ai-engineer → Recommendation features
growth-hacker → Scale user acquisition
sprint-prioritizer → Prioritize based on user feedback
```

## Agent Collaboration Examples

Agents work best when collaborating. Here's how they complement each other:

**Smart Contract Development:**
- **backend-architect** designs the contract
- **test-writer-fixer** writes comprehensive tests
- **devops-automator** sets up deployment pipeline

**User Interface Development:**
- **ui-designer** creates the visual design
- **frontend-developer** implements the components
- **test-writer-fixer** writes UI tests

**Feature Launch:**
- **sprint-prioritizer** decides what to build
- **backend-architect** + **frontend-developer** build it
- **test-writer-fixer** ensures quality
- **project-shipper** coordinates the launch
- **growth-hacker** drives adoption

## Key Zeroglaze Context (All Agents Know This)

**Your Tech Stack:**
- Frontend: Next.js 14+, React, TypeScript, Tailwind CSS, DaisyUI
- Backend: Next.js API Routes, Anchor Framework (Rust)
- Database: Supabase (PostgreSQL)
- Blockchain: Solana, SPL Token, Metaplex
- Real-time: Supabase Realtime, Solana WebSocket

**Your Business Model:**
- Streamers create tradable tokens via bonding curve
- Traders buy/sell tokens, pay platform fees
- Fees split between platform and streamer
- Streamer earnings tied to live streaming status

**Your Users:**
- **Streamers:** Small streamers (1K-10K followers) seeking early monetization
- **Traders:** Crypto enthusiasts who want to bet on streamers + be entertained

**Your Timeline:**
- 6-day sprint cycles
- MVP target: 6 weeks
- Launch: Mainnet deployment after security audit

## Tips for Working with Agents

1. **Be specific about your goal:** "Design the bonding curve with linear pricing" vs "Design a bonding curve"

2. **Mention context when needed:** "We're in sprint 2, focusing on trading features"

3. **Ask for collaboration:** "Have backend-architect and test-writer-fixer work together on the smart contract"

4. **Trust agent expertise:** They're specifically tuned to Zeroglaze's needs

5. **Iterate quickly:** Agents are designed for rapid 6-day development cycles

## Next Steps

You're all set! Just start working on Zeroglaze features naturally, and the relevant agents will activate automatically to help you ship faster and better.

**Try it now:**
- "Let's design the token trading smart contract"
- "Create a UI mockup for the streamer dashboard"
- "Plan our first 6-day sprint for the MVP"
- "Set up monitoring for production deployment"

## Need More Agents?

Additional agents from the Contains Studio repository can be added:
- **experiment-tracker** - Track A/B tests and feature experiments
- **analytics-reporter** - Analyze trading metrics and user behavior
- **content-creator** - Create educational content about the platform

Let me know if you'd like to add more!

---

**Agents installed on:** December 26, 2024
**Framework:** [Contains Studio Agents](https://github.com/contains-studio/agents)
**Customization:** Zeroglaze-specific context and workflows
