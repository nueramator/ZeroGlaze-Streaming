# Zeroglaze MVP - Deployment Automation Summary

Complete deployment automation has been set up for the Zeroglaze MVP. Deploy to production with minimal manual steps.

## Quick Deployment

### One-Command Deployment

```bash
# Complete deployment (program + database + frontend)
npm run deploy

# Or use the script directly
./scripts/deploy-all.sh --prod
```

This single command will:
1. Validate environment configuration
2. Deploy Solana program to devnet
3. Run database migrations
4. Deploy frontend to Vercel
5. Run post-deployment health checks

---

## What's Been Automated

### 1. Configuration Files

#### Vercel Configuration (`vercel.json`)
- Build and install commands optimized
- Environment variables configured
- Security headers (CORS, XSS protection)
- Cron jobs for stream status updates
- Health check endpoint routing

#### Vercel Ignore Rules (`.vercelignore`)
- Excludes unnecessary files from deployment
- Reduces deployment size
- Faster builds

### 2. Deployment Scripts

All scripts are located in `/scripts/` and are executable:

#### `deploy-all.sh`
**Complete deployment automation**

```bash
./scripts/deploy-all.sh --prod
```

Features:
- Pre-flight checks (tools, environment, balance)
- Deploys Solana program
- Runs database migrations
- Deploys frontend to Vercel
- Post-deployment verification
- Deployment summary

#### `deploy-program.sh`
**Solana program deployment**

```bash
./scripts/deploy-program.sh devnet
# or
npm run deploy:program
```

Features:
- Builds Anchor program
- Deploys to specified network (devnet/testnet/mainnet)
- Updates Anchor.toml
- Updates .env with Program ID
- Generates and copies IDL

#### `migrate-db.sh`
**Database migration**

```bash
./scripts/migrate-db.sh
# or
npm run deploy:db
```

Features:
- Runs Supabase migrations
- Verifies database connection
- Provides manual migration instructions if CLI not available

#### `setup-project.sh`
**Initial project setup**

```bash
./scripts/setup-project.sh
# or
npm run setup
```

Features:
- Checks all prerequisites
- Creates .env file from template
- Installs dependencies
- Configures Solana CLI
- Requests devnet airdrop
- Builds project

#### `validate-env.sh`
**Environment validation**

```bash
./scripts/validate-env.sh
# or
npm run validate:env
```

Features:
- Validates all required environment variables
- Checks variable formats
- Provides helpful error messages
- Security checks

### 3. GitHub Actions CI/CD

Three automated workflows configured:

#### Continuous Integration (`.github/workflows/ci.yml`)
**Runs on every PR**

- Lint and type checking
- Build Next.js frontend
- Build Anchor program
- Security vulnerability scan
- Uploads build artifacts

#### Devnet Deployment (`.github/workflows/deploy-devnet.yml`)
**Runs on push to main branch**

- Deploys Solana program to devnet
- Runs database migrations
- Deploys frontend to Vercel
- Updates environment variables
- Runs health checks
- Posts deployment summary

#### Preview Deployments (`.github/workflows/preview.yml`)
**Runs on every PR**

- Creates preview deployment on Vercel
- Comments PR with preview URL
- Allows testing before merge

### 4. Health Check & Monitoring

#### Health Endpoint (`/app/api/health/route.ts`)

```bash
curl https://your-app.vercel.app/api/health
```

Checks:
- Environment variables configured
- Database connectivity
- Solana RPC connectivity
- Response times
- Overall system health

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "uptime": 12345.67,
  "version": "1.0.0",
  "checks": {
    "env": { "status": "pass" },
    "database": { "status": "pass", "responseTime": 123 },
    "solana": { "status": "pass", "responseTime": 45 }
  }
}
```

#### Cron Job (`/app/api/cron/update-stream-status/route.ts`)

Automatically runs every 5 minutes:
- Checks Twitch API for stream status
- Updates database with current status
- Secured with CRON_SECRET

### 5. Comprehensive Documentation

Located in `/docs/deployment/`:

1. **QUICK_START.md** - Deploy in 15 minutes
2. **DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
3. **TROUBLESHOOTING.md** - Fix common issues
4. **GITHUB_SECRETS.md** - CI/CD secrets configuration
5. **CHECKLIST.md** - Deployment verification checklist
6. **README.md** - Documentation overview

---

## Available NPM Scripts

```json
{
  "deploy": "Complete deployment (all-in-one)",
  "deploy:program": "Deploy Solana program only",
  "deploy:db": "Run database migrations",
  "setup": "Initial project setup",
  "validate:env": "Validate environment config",
  "vercel:deploy": "Deploy to Vercel production",
  "vercel:preview": "Deploy to Vercel preview"
}
```

---

## Deployment Options

### Option 1: Automated Script (Recommended)

```bash
# First-time setup
npm run setup

# Deploy everything
npm run deploy
```

**Best for**: First deployment, quick updates

### Option 2: Manual Step-by-Step

```bash
# 1. Validate environment
npm run validate:env

# 2. Deploy program
npm run deploy:program

# 3. Run migrations
npm run deploy:db

# 4. Deploy frontend
npm run vercel:deploy
```

**Best for**: Troubleshooting, learning, custom deployments

### Option 3: CI/CD Automation

```bash
# Push to main branch
git push origin main

# GitHub Actions automatically:
# 1. Runs tests
# 2. Deploys program
# 3. Runs migrations
# 4. Deploys frontend
# 5. Runs health checks
```

**Best for**: Team collaboration, ongoing development

---

## Required Setup (One-Time)

### 1. Create Accounts

- **Supabase**: [app.supabase.com](https://app.supabase.com) - Free tier
- **Vercel**: [vercel.com](https://vercel.com) - Free tier
- **GitHub**: [github.com](https://github.com) - Free (for CI/CD)

### 2. Install Tools

```bash
# Vercel CLI
npm install -g vercel

# Supabase CLI (optional but recommended)
npm install -g supabase

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
```

### 3. Configure Environment

```bash
# Run setup script
npm run setup

# Or manually:
cp .env.example .env
# Edit .env with your values
```

### 4. Set Up GitHub Secrets (for CI/CD)

See [docs/deployment/GITHUB_SECRETS.md](./docs/deployment/GITHUB_SECRETS.md) for complete list.

Required secrets:
- `VERCEL_TOKEN`
- `VERCEL_DOMAIN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `NEXT_PUBLIC_PROGRAM_ID`
- `SOLANA_DEPLOYER_KEYPAIR`
- `WEBHOOK_SECRET`
- `CRON_SECRET`

---

## Deployment Workflow

### Development Workflow

```bash
# 1. Make changes
git checkout -b feature/my-feature

# 2. Test locally
npm run dev
npm run type-check
npm run lint

# 3. Create PR
git push origin feature/my-feature

# 4. GitHub Actions runs:
#    - CI tests
#    - Preview deployment

# 5. Merge to main
#    GitHub Actions automatically deploys to production
```

### Manual Deployment Workflow

```bash
# 1. Validate configuration
npm run validate:env

# 2. Deploy program (if changed)
npm run deploy:program

# 3. Run migrations (if changed)
npm run deploy:db

# 4. Deploy frontend
npm run vercel:deploy

# 5. Verify deployment
curl https://your-app.vercel.app/api/health
```

---

## Environment-Specific Deployments

### Devnet (Current MVP)

```bash
# In .env
SOLANA_NETWORK=devnet
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com

# Deploy
npm run deploy
```

### Mainnet (Future Production)

```bash
# In .env
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=XXX

# Deploy with caution
./scripts/deploy-program.sh mainnet-beta
npm run vercel:deploy
```

---

## Monitoring & Observability

### Built-In Monitoring

1. **Health Endpoint**: `/api/health`
   - System status
   - Component health
   - Response times

2. **Vercel Analytics** (Enable in dashboard)
   - Page views
   - Performance metrics
   - Error tracking

3. **Supabase Logs** (Dashboard)
   - Database queries
   - API requests
   - Error logs

### Recommended External Tools

1. **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com)
   - Monitor: `https://your-app.vercel.app/api/health`
   - Free tier: 50 monitors

2. **Error Tracking**: [Sentry](https://sentry.io)
   ```bash
   npm install @sentry/nextjs
   ```

3. **Analytics**: Vercel Analytics (built-in)

---

## Security Features

### Built-In Security

1. **Environment Variables**
   - Never committed to git
   - Validated before deployment
   - Encrypted in Vercel/GitHub

2. **Security Headers**
   - CORS configured
   - XSS protection
   - Content security policy
   - Frame protection

3. **API Security**
   - Webhook signature verification
   - JWT authentication (when enabled)
   - Rate limiting (when enabled)
   - Cron job authentication

4. **Database Security**
   - Row-level security (RLS) enabled
   - Service role key protected
   - Connection pooling

---

## Rollback Procedures

### Frontend Rollback

```bash
# Via Vercel Dashboard
# Deployments → Previous deployment → Promote to Production

# Via CLI
vercel rollback
```

### Program Rollback

**Note**: Smart contracts are immutable. To "rollback":

```bash
# 1. Deploy previous version as new program
./scripts/deploy-program.sh devnet

# 2. Update environment variable
vercel env add NEXT_PUBLIC_PROGRAM_ID production
# Enter previous program ID

# 3. Redeploy frontend
vercel --prod
```

### Database Rollback

```sql
-- Manual rollback via SQL Editor
BEGIN;
-- Run rollback SQL
ROLLBACK;  -- or COMMIT if successful
```

---

## Cost Summary

### Free Tier (MVP)
- Vercel: $0
- Supabase: $0
- Solana Devnet: $0
- GitHub Actions: $0

**Total: $0/month**

### Production Tier
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Helius RPC: $0-50/month
- Domain: ~$1/month

**Total: ~$45-100/month**

---

## Support & Resources

### Documentation
- [Quick Start](./docs/deployment/QUICK_START.md) - 15-minute deployment
- [Full Guide](./docs/deployment/DEPLOYMENT_GUIDE.md) - Complete instructions
- [Troubleshooting](./docs/deployment/TROUBLESHOOTING.md) - Fix issues
- [GitHub Secrets](./docs/deployment/GITHUB_SECRETS.md) - CI/CD setup
- [Checklist](./docs/deployment/CHECKLIST.md) - Verification steps

### Scripts
- `/scripts/deploy-all.sh` - Complete deployment
- `/scripts/deploy-program.sh` - Program only
- `/scripts/migrate-db.sh` - Database only
- `/scripts/setup-project.sh` - Initial setup
- `/scripts/validate-env.sh` - Validation

### Get Help
- Review logs: `vercel logs`
- Check health: `curl https://your-app.vercel.app/api/health`
- Validate env: `npm run validate:env`
- See troubleshooting guide

---

## Next Steps

After deployment:

1. **Verify Everything Works**
   ```bash
   # Run checklist
   cat docs/deployment/CHECKLIST.md
   ```

2. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Configure uptime monitoring
   - Set up error tracking

3. **Configure Custom Domain** (optional)
   - Add domain in Vercel
   - Update DNS records
   - Update NEXT_PUBLIC_APP_URL

4. **Enable Auto-Deploy**
   - Set up GitHub secrets
   - Push to main for auto-deploy

5. **Start Building Features**
   - User authentication
   - Advanced trading
   - Analytics
   - Mobile support

---

## File Structure

```
zeroglaze/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline
│       ├── deploy-devnet.yml        # Auto-deploy
│       └── preview.yml              # PR previews
├── app/
│   └── api/
│       ├── health/route.ts          # Health check
│       └── cron/
│           └── update-stream-status/route.ts
├── docs/
│   └── deployment/
│       ├── README.md                # Documentation index
│       ├── QUICK_START.md           # 15-min guide
│       ├── DEPLOYMENT_GUIDE.md      # Complete guide
│       ├── TROUBLESHOOTING.md       # Fix issues
│       ├── GITHUB_SECRETS.md        # CI/CD setup
│       └── CHECKLIST.md             # Verification
├── scripts/
│   ├── deploy-all.sh                # Complete deployment
│   ├── deploy-program.sh            # Program only
│   ├── migrate-db.sh                # Database only
│   ├── setup-project.sh             # Initial setup
│   └── validate-env.sh              # Validation
├── .env.example                      # Environment template
├── .vercelignore                     # Vercel ignore rules
├── vercel.json                       # Vercel config
└── DEPLOYMENT_AUTOMATION.md          # This file
```

---

**Ready to deploy?** Run `npm run deploy` or see [Quick Start Guide](./docs/deployment/QUICK_START.md)!
