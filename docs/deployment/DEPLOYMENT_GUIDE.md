# Zeroglaze MVP - Complete Deployment Guide

This guide covers the complete deployment process for the Zeroglaze MVP to Solana Devnet and Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Deployment](#manual-deployment)
4. [CI/CD Deployment](#cicd-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org))
- **npm** or **yarn**
- **Git**
- **Vercel CLI**: `npm install -g vercel`

### For Solana Program Deployment

- **Rust** ([Install](https://rustup.rs))
- **Solana CLI** ([Install](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor CLI** v0.29.0:
  ```bash
  cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
  ```

### Required Accounts

- **Supabase Account** ([Sign up](https://app.supabase.com))
- **Vercel Account** ([Sign up](https://vercel.com))
- **Twitch Developer Account** (optional, [Sign up](https://dev.twitch.tv))
- **Solana Wallet** with devnet SOL

---

## Quick Start

The fastest way to deploy the entire MVP:

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd zeroglaze

# 2. Run setup script
./scripts/setup-project.sh

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Validate configuration
./scripts/validate-env.sh

# 5. Deploy everything
./scripts/deploy-all.sh --prod
```

That's it! Your MVP will be deployed to:
- **Program**: Solana Devnet
- **Frontend**: Vercel
- **Database**: Supabase

---

## Manual Deployment

### Step 1: Environment Setup

#### 1.1 Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `zeroglaze-mvp`
   - Database Password: (save this!)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)
5. Save these values:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Public Key: `eyJxxxx...`
   - Service Role Key: `eyJxxxx...` (keep secret!)

#### 1.2 Run Database Migrations

```bash
# Option 1: Using Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push

# Option 2: Manual via SQL Editor
# Go to Supabase Dashboard > SQL Editor
# Run supabase/migrations/001_initial_schema.sql
# Run supabase/migrations/002_seed_data.sql
```

Verify tables were created:
- `streamers`
- `tokens`
- `trades`
- `stream_status`
- `earnings`

#### 1.3 Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env
```

Required variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# Solana
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Security
WEBHOOK_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Validate configuration:
```bash
./scripts/validate-env.sh
```

### Step 2: Deploy Solana Program

#### 2.1 Configure Solana CLI

```bash
# Set network to devnet
solana config set --url https://api.devnet.solana.com

# Create or use existing wallet
solana-keygen new --no-bip39-passphrase

# Get wallet address
solana address

# Request airdrop (devnet only)
solana airdrop 2
```

#### 2.2 Build and Deploy Program

```bash
# Using deployment script (recommended)
./scripts/deploy-program.sh devnet

# Or manually
cd programs/zeroglaze
anchor build
anchor deploy --provider.cluster devnet
```

Save the **Program ID** from the output:
```
Program Id: ZERO123abc456def789...
```

#### 2.3 Update Environment with Program ID

```bash
# Automatically done by deploy script, or manually:
echo "NEXT_PUBLIC_PROGRAM_ID=<your-program-id>" >> .env
```

### Step 3: Deploy Frontend to Vercel

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login to Vercel

```bash
vercel login
```

#### 3.3 Configure Project

```bash
# Link to Vercel (first time only)
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: zeroglaze-mvp
# - Directory: ./
# - Override settings: No
```

#### 3.4 Set Environment Variables in Vercel

```bash
# Add all environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_PROGRAM_ID production
vercel env add SOLANA_RPC_ENDPOINT production
vercel env add SOLANA_NETWORK production
vercel env add WEBHOOK_SECRET production
vercel env add JWT_SECRET production

# For Twitch integration (optional)
vercel env add TWITCH_CLIENT_ID production
vercel env add TWITCH_CLIENT_SECRET production
```

#### 3.5 Deploy to Production

```bash
# Build and deploy
vercel --prod

# Or let the script handle it
./scripts/deploy-all.sh --prod
```

Your app will be live at: `https://zeroglaze-mvp.vercel.app`

---

## CI/CD Deployment

Automated deployment using GitHub Actions.

### Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Vercel Secrets
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_DOMAIN=zeroglaze-mvp.vercel.app
```

Get Vercel token:
```bash
vercel login
# Go to: https://vercel.com/account/tokens
# Create new token
```

#### Supabase Secrets
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
SUPABASE_PROJECT_REF=xxxxx
SUPABASE_ACCESS_TOKEN=<your-access-token>
```

#### Solana Secrets
```
NEXT_PUBLIC_PROGRAM_ID=ZERO123abc456def789...
SOLANA_DEPLOYER_KEYPAIR=[1,2,3,...]  # Your keypair JSON
```

Get keypair array:
```bash
cat ~/.config/solana/id.json
```

#### Security Secrets
```
WEBHOOK_SECRET=<random-32-byte-hex>
JWT_SECRET=<random-32-byte-hex>
CRON_SECRET=<random-32-byte-hex>
```

### Deployment Workflows

Three workflows are configured:

#### 1. CI - Build and Test (`.github/workflows/ci.yml`)
Runs on every PR:
- Lint and type check
- Build Next.js app
- Build Anchor program
- Security scan

#### 2. Deploy to Devnet (`.github/workflows/deploy-devnet.yml`)
Runs on push to `main`:
- Deploy Solana program to devnet
- Run database migrations
- Deploy frontend to Vercel
- Run health checks

#### 3. Preview Deployments (`.github/workflows/preview.yml`)
Runs on every PR:
- Deploy preview to Vercel
- Comment PR with preview URL

### Triggering Deployments

```bash
# Automatic deployment on push to main
git push origin main

# Manual deployment via GitHub Actions
# Go to: Actions → Deploy to Devnet → Run workflow

# Preview deployment on PR
# Automatic when you create a PR
```

---

## Post-Deployment

### Verification Checklist

#### 1. Health Check

```bash
# Check application health
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "checks": {
    "env": { "status": "pass" },
    "database": { "status": "pass" },
    "solana": { "status": "pass" }
  }
}
```

#### 2. Test API Endpoints

```bash
# Test token list
curl https://your-app.vercel.app/api/tokens/list

# Test trading quote
curl -X POST https://your-app.vercel.app/api/trading/quote \
  -H "Content-Type: application/json" \
  -d '{"mint":"test","amount":100,"type":"buy"}'
```

#### 3. Test Frontend

Visit your deployment URL and verify:
- [ ] Homepage loads
- [ ] Wallet connection works
- [ ] Can navigate to /streamer page
- [ ] Can navigate to /trader page
- [ ] No console errors

#### 4. Test Wallet Integration

1. Connect Phantom wallet (switch to Devnet)
2. Try creating a token (streamer flow)
3. Try trading (trader flow)
4. Verify transactions in [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

#### 5. Verify Database

In Supabase Dashboard:
- Check Tables → tokens (should have seed data)
- Check Logs → API Logs (no errors)
- Check Database → Usage (connections active)

### Monitoring Setup

#### Enable Vercel Analytics

1. Go to Vercel Dashboard → Your Project
2. Analytics → Enable
3. Monitor:
   - Page views
   - Response times
   - Error rates

#### Monitor Supabase

1. Go to Supabase Dashboard
2. Check regularly:
   - Database → Usage
   - API → Logs
   - Realtime → Connections

#### Set Up Alerts (Optional)

```bash
# UptimeRobot for uptime monitoring
# Add your deployment URL: https://your-app.vercel.app/api/health

# Sentry for error tracking
npm install @sentry/nextjs
```

### Update Custom Domain (Optional)

#### In Vercel Dashboard:

1. Go to Project Settings → Domains
2. Add domain (e.g., `zeroglaze.com`)
3. Follow DNS configuration instructions
4. Update environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL production
   # Enter: https://zeroglaze.com
   ```

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Quick Fixes

#### Build Fails on Vercel

**Error**: `npm install` fails
```bash
# In vercel.json, ensure:
"installCommand": "npm install --no-optional"
```

#### Database Connection Fails

**Error**: Can't connect to Supabase
```bash
# Check environment variables
vercel env ls

# Verify in Supabase dashboard:
# - Project is active
# - Database is running
# - Anon key is correct
```

#### Wallet Won't Connect

**Error**: Phantom wallet connection fails
```bash
# Ensure user is on correct network (Devnet)
# Check browser console for errors
# Verify wallet adapter is configured correctly
```

#### Program Deployment Fails

**Error**: Insufficient SOL
```bash
# Request more devnet SOL
solana airdrop 2
```

---

## Rollback Procedures

### Frontend Rollback

```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI
vercel rollback
```

### Database Rollback

```sql
-- In Supabase SQL Editor
BEGIN;
-- Your changes
-- If something breaks:
ROLLBACK;
```

### Program Update

Smart contracts are immutable. To "rollback":
1. Deploy new version with fixes
2. Update `NEXT_PUBLIC_PROGRAM_ID`
3. Redeploy frontend

---

## Next Steps

- [ ] Set up monitoring alerts
- [ ] Configure custom domain
- [ ] Add error tracking (Sentry)
- [ ] Set up automated backups
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Solana Docs**: [docs.solana.com](https://docs.solana.com)
- **Anchor Docs**: [anchor-lang.com](https://anchor-lang.com)

---

**Deployment Complete!** Your Zeroglaze MVP is now live on Solana Devnet.
