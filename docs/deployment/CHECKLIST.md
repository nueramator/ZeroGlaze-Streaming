# Deployment Checklist

Use this checklist to ensure a smooth deployment of the Zeroglaze MVP.

## Pre-Deployment

### Development Environment
- [ ] Node.js 18+ installed
- [ ] npm packages installed (`npm install`)
- [ ] Project builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] All tests pass (if applicable)

### Accounts & Access
- [ ] Supabase account created
- [ ] Vercel account created
- [ ] GitHub account (for CI/CD)
- [ ] Solana wallet created with devnet SOL
- [ ] Twitch Developer account (optional)

### Configuration Files
- [ ] `.env` file created from `.env.example`
- [ ] All required environment variables set
- [ ] Environment validated (`./scripts/validate-env.sh`)
- [ ] `.gitignore` includes `.env`
- [ ] Sensitive files not committed

---

## Supabase Setup

### Project Creation
- [ ] Supabase project created
- [ ] Project region selected (closest to users)
- [ ] Database password saved securely
- [ ] Project URL copied
- [ ] Anon key copied
- [ ] Service role key copied (keep secret!)

### Database Migrations
- [ ] Migration files reviewed
- [ ] `001_initial_schema.sql` executed
- [ ] `002_seed_data.sql` executed
- [ ] All tables created successfully:
  - [ ] `streamers`
  - [ ] `tokens`
  - [ ] `trades`
  - [ ] `stream_status`
  - [ ] `earnings`
- [ ] RLS policies enabled
- [ ] Seed data loaded (3 test tokens)

### Database Verification
- [ ] Can query tables from SQL Editor
- [ ] RLS policies working
- [ ] No error logs in Supabase dashboard
- [ ] Connection pooling configured (if needed)

---

## Solana Program Deployment

### Solana CLI Setup
- [ ] Solana CLI installed
- [ ] Network configured to devnet
- [ ] Wallet keypair exists
- [ ] Wallet has sufficient SOL (2+ SOL)
- [ ] Can connect to devnet RPC

### Anchor Setup
- [ ] Rust installed
- [ ] Anchor CLI v0.29.0 installed
- [ ] `Anchor.toml` configured correctly
- [ ] Program builds without errors

### Deployment
- [ ] Program built successfully (`anchor build`)
- [ ] Program deployed to devnet
- [ ] Program ID saved
- [ ] Program ID added to `.env`
- [ ] Program ID added to `Anchor.toml`
- [ ] IDL generated and saved
- [ ] Deployment verified on Solana Explorer

### Program Verification
- [ ] Can view program: `solana program show <program-id>`
- [ ] Program size reasonable (< 1MB)
- [ ] Program upgrade authority correct
- [ ] Test transaction works

---

## Vercel Deployment

### Vercel Setup
- [ ] Vercel CLI installed
- [ ] Logged into Vercel (`vercel login`)
- [ ] Project linked to Vercel
- [ ] Team/organization selected (if applicable)

### Environment Variables
All environment variables added to Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_PROGRAM_ID`
- [ ] `SOLANA_RPC_ENDPOINT`
- [ ] `SOLANA_NETWORK`
- [ ] `WEBHOOK_SECRET`
- [ ] `JWT_SECRET` (if using)
- [ ] `CRON_SECRET` (for scheduled tasks)
- [ ] `TWITCH_CLIENT_ID` (if using)
- [ ] `TWITCH_CLIENT_SECRET` (if using)
- [ ] `NEXT_PUBLIC_APP_URL`

### Build Configuration
- [ ] `vercel.json` configured
- [ ] `.vercelignore` configured
- [ ] Build command: `npm run build`
- [ ] Install command: `npm install --no-optional`
- [ ] Framework preset: Next.js

### Deployment
- [ ] Preview deployment successful
- [ ] Production deployment successful
- [ ] Deployment URL accessible
- [ ] No build errors in Vercel logs

---

## GitHub Actions CI/CD (Optional but Recommended)

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] Repository is private (or public if intended)
- [ ] Branch protection rules set (optional)

### GitHub Secrets
All secrets added to GitHub repository:
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_DOMAIN`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_PROJECT_REF`
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `NEXT_PUBLIC_PROGRAM_ID`
- [ ] `SOLANA_DEPLOYER_KEYPAIR`
- [ ] `WEBHOOK_SECRET`
- [ ] `CRON_SECRET`

### Workflow Files
- [ ] `.github/workflows/ci.yml` present
- [ ] `.github/workflows/deploy-devnet.yml` present
- [ ] `.github/workflows/preview.yml` present
- [ ] Workflow syntax valid
- [ ] Workflows enabled in GitHub settings

### CI/CD Testing
- [ ] CI workflow passes on PR
- [ ] Preview deployment works
- [ ] Auto-deploy on main branch works
- [ ] Can manually trigger deployment

---

## Post-Deployment Verification

### Health Checks
- [ ] Health endpoint accessible: `/api/health`
- [ ] Health status is "healthy"
- [ ] All checks passing:
  - [ ] Environment variables
  - [ ] Database connection
  - [ ] Solana RPC connection

### API Endpoints
- [ ] `/api/tokens/list` works
- [ ] `/api/trading/quote` works
- [ ] `/api/webhook/stream-status` accessible
- [ ] All endpoints return expected responses
- [ ] No 500 errors in logs

### Frontend Testing
- [ ] Homepage loads
- [ ] No console errors
- [ ] Wallet adapter loads
- [ ] Can navigate to all pages:
  - [ ] `/`
  - [ ] `/streamer`
  - [ ] `/trader`
- [ ] Images and assets load
- [ ] Responsive on mobile

### Wallet Integration
- [ ] Phantom wallet detects the app
- [ ] Can connect wallet
- [ ] Wallet shows correct network (Devnet)
- [ ] Can disconnect wallet
- [ ] Connection state persists on refresh

### Transaction Testing
- [ ] Can create token (streamer flow)
- [ ] Transaction submits successfully
- [ ] Transaction confirms on-chain
- [ ] Can view transaction in explorer
- [ ] Database updates correctly
- [ ] Can perform trade (trader flow)

---

## Monitoring & Observability

### Vercel Monitoring
- [ ] Vercel Analytics enabled
- [ ] Can view deployment metrics
- [ ] Function logs accessible
- [ ] Error tracking configured

### Supabase Monitoring
- [ ] Can view API logs
- [ ] Can view database logs
- [ ] Usage metrics visible
- [ ] No rate limit warnings

### Solana Monitoring
- [ ] Can view program on Explorer
- [ ] Can see transaction history
- [ ] RPC endpoint responding
- [ ] No rate limiting issues

### Uptime Monitoring (Optional)
- [ ] Uptime monitor configured (UptimeRobot, etc.)
- [ ] Health check URL added
- [ ] Alert notifications set up
- [ ] Response time tracking enabled

---

## Security Checklist

### Environment Security
- [ ] `.env` not committed to git
- [ ] `.env.example` has placeholder values only
- [ ] Service role keys kept secret
- [ ] Keypairs stored securely
- [ ] GitHub secrets properly configured

### Application Security
- [ ] CORS configured correctly
- [ ] API rate limiting enabled
- [ ] Webhook signatures verified
- [ ] SQL injection prevention (using Supabase)
- [ ] XSS protection enabled
- [ ] CSRF protection (where applicable)

### Solana Security
- [ ] Program upgrade authority set correctly
- [ ] Transaction size limits enforced
- [ ] Fee calculations validated
- [ ] Token freeze mechanism tested (if implemented)
- [ ] Admin functions protected

### Access Control
- [ ] Supabase RLS policies enabled
- [ ] API authentication working
- [ ] Admin endpoints protected
- [ ] User permissions correct

---

## Performance Checklist

### Frontend Performance
- [ ] Page load time < 3s
- [ ] Time to Interactive < 5s
- [ ] No layout shift
- [ ] Images optimized
- [ ] Code splitting configured
- [ ] Lazy loading where appropriate

### API Performance
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Indexes created where needed
- [ ] Connection pooling enabled
- [ ] Caching configured

### Solana Performance
- [ ] RPC calls optimized
- [ ] Transaction confirmation < 30s
- [ ] Using websocket for updates (if needed)
- [ ] Batching RPC requests where possible

---

## Documentation

- [ ] README.md updated with deployment URL
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available
- [ ] Architecture diagrams updated

---

## Rollback Plan

### Preparation
- [ ] Previous working version identified
- [ ] Database backup created
- [ ] Rollback procedure documented
- [ ] Team knows rollback process

### Rollback Readiness
- [ ] Can rollback Vercel deployment
- [ ] Can restore database if needed
- [ ] Can redeploy previous program version (if needed)
- [ ] Downtime communication plan ready

---

## Final Checklist

### Before Going Live
- [ ] All tests passing
- [ ] All checklist items complete
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Monitoring in place
- [ ] Rollback plan ready

### After Going Live
- [ ] Monitor for errors (first hour)
- [ ] Check all metrics
- [ ] Verify user flows
- [ ] Test from different devices
- [ ] Test from different locations
- [ ] Announce launch

### Within 24 Hours
- [ ] Review analytics
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Fix any critical issues

### Within 1 Week
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security review
- [ ] Documentation updates
- [ ] Plan next iteration

---

## Sign-Off

Deployment completed by: ___________________

Date: ___________________

Deployment URL: ___________________

Program ID: ___________________

Issues encountered: ___________________

___________________

___________________

---

**Use this checklist for every deployment to ensure consistency and completeness!**
