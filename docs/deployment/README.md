# Zeroglaze Deployment Documentation

Complete deployment automation and documentation for the Zeroglaze MVP.

## Overview

This directory contains everything you need to deploy the Zeroglaze MVP to production (Solana Devnet + Vercel).

## Quick Links

- **New to Deployment?** → Start with [Quick Start Guide](./QUICK_START.md)
- **Full Deployment** → See [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- **Issues?** → Check [Troubleshooting](./TROUBLESHOOTING.md)
- **CI/CD Setup** → See [GitHub Secrets Guide](./GITHUB_SECRETS.md)
- **Step-by-Step** → Use [Deployment Checklist](./CHECKLIST.md)

---

## What's Included

### Documentation

1. **[QUICK_START.md](./QUICK_START.md)** - Deploy in 15 minutes
   - Fastest path to production
   - Step-by-step commands
   - Minimal explanation
   - Perfect for quick deployment

2. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
   - Detailed explanations
   - Multiple deployment methods
   - Configuration options
   - Post-deployment verification
   - Best practices

3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Fix common issues
   - Categorized by deployment stage
   - Common error messages
   - Step-by-step solutions
   - Diagnostic commands

4. **[GITHUB_SECRETS.md](./GITHUB_SECRETS.md)** - CI/CD configuration
   - All required secrets explained
   - How to get each value
   - Security best practices
   - Secret rotation guide

5. **[CHECKLIST.md](./CHECKLIST.md)** - Deployment checklist
   - Pre-deployment checks
   - Step-by-step verification
   - Post-deployment testing
   - Sign-off template

### Automation Scripts

Located in `/scripts/`:

1. **`deploy-all.sh`** - Complete deployment automation
   - Deploys everything in one command
   - Pre-flight checks
   - Solana program deployment
   - Database migration
   - Frontend deployment
   - Post-deployment verification

2. **`deploy-program.sh`** - Solana program deployment
   - Builds Anchor program
   - Deploys to specified network
   - Updates configuration files
   - Verifies deployment

3. **`migrate-db.sh`** - Database migration
   - Runs Supabase migrations
   - Verifies database connection
   - Seed data loading

4. **`setup-project.sh`** - Initial project setup
   - Checks prerequisites
   - Creates environment files
   - Installs dependencies
   - Configures Solana CLI

5. **`validate-env.sh`** - Environment validation
   - Checks all required variables
   - Validates formats
   - Provides helpful error messages

### CI/CD Workflows

Located in `/.github/workflows/`:

1. **`ci.yml`** - Continuous Integration
   - Runs on every PR
   - Lint and type checking
   - Build verification
   - Security scanning

2. **`deploy-devnet.yml`** - Devnet deployment
   - Runs on push to main
   - Deploys Solana program
   - Runs database migrations
   - Deploys frontend
   - Health checks

3. **`preview.yml`** - Preview deployments
   - Runs on every PR
   - Creates preview deployment
   - Comments PR with URL

### Configuration Files

Located in project root:

1. **`vercel.json`** - Vercel configuration
   - Build settings
   - Environment variables
   - Headers and CORS
   - Cron jobs

2. **`.vercelignore`** - Vercel ignore rules
   - Excludes unnecessary files
   - Optimizes deployment size

3. **`.env.example`** - Environment template
   - All required variables
   - Helpful comments
   - Example values

---

## Deployment Options

### Option 1: Automated Script (Recommended for First Deploy)

```bash
# One command to deploy everything
./scripts/deploy-all.sh --prod
```

**Use when**:
- First time deploying
- Want guided setup
- Need verification steps

### Option 2: Manual Deployment (Best for Learning)

Follow [Deployment Guide](./DEPLOYMENT_GUIDE.md)

**Use when**:
- Want to understand each step
- Need custom configuration
- Troubleshooting issues

### Option 3: CI/CD (Best for Ongoing Development)

Set up [GitHub Actions](./GITHUB_SECRETS.md)

**Use when**:
- Deploying regularly
- Working in a team
- Want automated testing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    (Vercel - Next.js)                       │
│  https://zeroglaze-mvp.vercel.app                          │
└──────────────┬───────────────────────────┬──────────────────┘
               │                           │
               ▼                           ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │    Supabase      │      │   Solana Devnet      │
    │   (Database)     │      │  (Smart Contract)    │
    │                  │      │                      │
    │ - PostgreSQL     │      │ - Anchor Program     │
    │ - REST API       │      │ - Token Creation     │
    │ - Real-time      │      │ - Trading Logic      │
    └──────────────────┘      └──────────────────────┘
```

### Components

**Frontend (Vercel)**:
- Next.js application
- Wallet adapter
- Trading interface
- Admin dashboard

**Database (Supabase)**:
- PostgreSQL database
- REST API
- Row-level security
- Real-time subscriptions

**Blockchain (Solana)**:
- Anchor program
- Token creation
- Bonding curve
- Trading logic

**External Services**:
- Twitch API (stream status)
- Helius/QuickNode (RPC)

---

## Deployment Flow

### Automated Deployment (CI/CD)

```
┌─────────────┐
│ Git Push    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ GitHub Actions  │
│   - Lint/Test   │
│   - Build       │
└──────┬──────────┘
       │
       ├─────────────────┬──────────────────┐
       ▼                 ▼                  ▼
┌────────────┐  ┌────────────────┐  ┌─────────────┐
│  Program   │  │   Database     │  │  Frontend   │
│  Deploy    │  │   Migration    │  │   Deploy    │
└──────┬─────┘  └──────┬─────────┘  └──────┬──────┘
       │                │                   │
       └────────────────┴───────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Health Checks    │
              │   - API test     │
              │   - DB connect   │
              │   - RPC status   │
              └──────────────────┘
```

### Manual Deployment

```
1. Setup Environment
   ├─ Create .env
   ├─ Validate config
   └─ Install dependencies

2. Deploy Database
   ├─ Create Supabase project
   ├─ Run migrations
   └─ Seed data

3. Deploy Program
   ├─ Build Anchor
   ├─ Deploy to Devnet
   └─ Save Program ID

4. Deploy Frontend
   ├─ Configure Vercel
   ├─ Set env vars
   └─ Deploy

5. Verify
   ├─ Health checks
   ├─ Test endpoints
   └─ Test user flows
```

---

## Environment-Specific Configs

### Development
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging (Preview)
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_APP_URL=https://zeroglaze-staging.vercel.app
```

### Production (Devnet for MVP)
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_APP_URL=https://zeroglaze.com
```

### Production (Mainnet - Future)
```bash
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=XXX
NEXT_PUBLIC_APP_URL=https://zeroglaze.com
```

---

## Cost Estimates

### MVP (Free Tier)
- **Vercel**: $0 (Hobby plan)
- **Supabase**: $0 (Free tier - 500MB DB)
- **Solana Devnet**: $0 (test network)
- **GitHub Actions**: $0 (2,000 minutes/month free)

**Total: $0/month**

### Production (Paid Tier)
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Helius RPC**: $0-50/month (based on usage)
- **Domain**: $10-15/year
- **Monitoring**: $0-30/month (optional)

**Total: ~$45-125/month**

### Scaling (High Traffic)
- **Vercel Enterprise**: Custom pricing
- **Supabase Team**: $599/month
- **Dedicated RPC**: $100-500/month
- **CDN**: Included in Vercel

**Total: $800-1500+/month**

---

## Support & Resources

### Official Documentation
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Solana**: [docs.solana.com](https://docs.solana.com)
- **Anchor**: [anchor-lang.com](https://anchor-lang.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

### Community
- **Solana Discord**: [discord.gg/solana](https://discord.gg/solana)
- **Anchor Discord**: [discord.gg/anchor](https://discord.gg/anchor)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)

### Troubleshooting
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review error logs
3. Search existing issues
4. Ask in Discord communities

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error rates
- Check uptime
- Review logs

**Weekly**:
- Review analytics
- Update dependencies
- Security checks

**Monthly**:
- Rotate secrets
- Database backups
- Performance review
- Cost analysis

**Quarterly**:
- Security audit
- Load testing
- Documentation updates
- Disaster recovery test

---

## Next Steps After Deployment

1. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Configure uptime monitoring
   - Set up error tracking (Sentry)

2. **Optimize Performance**
   - Review Core Web Vitals
   - Optimize images
   - Implement caching
   - Add CDN

3. **Security Hardening**
   - Enable rate limiting
   - Add CAPTCHA
   - Audit smart contracts
   - Penetration testing

4. **Add Features**
   - User authentication
   - Advanced trading
   - Analytics dashboard
   - Mobile app

5. **Scale Infrastructure**
   - Upgrade to paid tiers
   - Add dedicated RPC
   - Implement caching layer
   - Geographic distribution

---

## Contributing

Improvements to deployment automation welcome!

**To contribute**:
1. Test changes thoroughly
2. Update documentation
3. Add to checklist if needed
4. Submit PR with description

---

**Ready to deploy?** Start with the [Quick Start Guide](./QUICK_START.md)!
