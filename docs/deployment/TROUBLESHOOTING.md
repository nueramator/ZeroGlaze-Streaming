# Deployment Troubleshooting Guide

Comprehensive troubleshooting guide for Zeroglaze MVP deployment issues.

## Table of Contents

1. [Pre-Deployment Issues](#pre-deployment-issues)
2. [Solana Program Deployment](#solana-program-deployment)
3. [Database Issues](#database-issues)
4. [Frontend Deployment](#frontend-deployment)
5. [CI/CD Issues](#cicd-issues)
6. [Runtime Errors](#runtime-errors)
7. [Performance Issues](#performance-issues)

---

## Pre-Deployment Issues

### Environment Variables Not Set

**Symptom**: Validation script shows missing variables

**Solution**:
```bash
# Check what's missing
./scripts/validate-env.sh

# Copy example file
cp .env.example .env

# Edit and add missing values
nano .env

# Validate again
./scripts/validate-env.sh
```

### Command Not Found Errors

**Symptom**: `command not found: solana`, `anchor`, or `vercel`

**Solutions**:

For Solana CLI:
```bash
# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify
solana --version
```

For Anchor CLI:
```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli

# Verify
anchor --version
```

For Vercel CLI:
```bash
npm install -g vercel

# Verify
vercel --version
```

### Node Version Mismatch

**Symptom**: Build fails with Node.js version error

**Solution**:
```bash
# Check current version
node -v

# If < 18, upgrade Node.js
# Using nvm (recommended):
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

## Solana Program Deployment

### Insufficient SOL Balance

**Symptom**: `Error: Insufficient funds`

**Solution**:
```bash
# Check balance
solana balance

# Request airdrop (devnet only)
solana airdrop 2

# Wait a few seconds and try again
solana airdrop 2

# Verify balance
solana balance
```

**If airdrop fails** (common on devnet):
```bash
# Try multiple times
for i in {1..5}; do solana airdrop 2 && break || sleep 5; done

# Or use a faucet
# Visit: https://faucet.solana.com
# Or: https://solfaucet.com
```

### Wrong Network Configuration

**Symptom**: Deploying to wrong network or can't connect

**Solution**:
```bash
# Check current config
solana config get

# Set to devnet
solana config set --url https://api.devnet.solana.com

# Verify
solana config get

# Expected output should show:
# RPC URL: https://api.devnet.solana.com
```

### Anchor Build Fails

**Symptom**: `anchor build` fails with compilation errors

**Solutions**:

1. **Check Rust version**:
```bash
rustc --version
# Should be stable and recent

# Update Rust
rustup update stable
```

2. **Clean build artifacts**:
```bash
cd programs/zeroglaze
anchor clean
anchor build
```

3. **Check dependencies**:
```bash
# Verify Anchor.toml has correct version
cat ../../Anchor.toml

# Should show:
# anchor_version = "0.29.0"
```

4. **Check for syntax errors**:
```bash
# Review error messages
# Common issues:
# - Missing dependencies in Cargo.toml
# - Type mismatches
# - Missing imports
```

### Program Deployment Hangs

**Symptom**: `anchor deploy` hangs or times out

**Solution**:
```bash
# Increase timeout
anchor deploy --provider.cluster devnet --provider.timeout 120000

# Or deploy binary directly
solana program deploy target/deploy/zeroglaze.so

# Check program status
solana program show <program-id>
```

### Program Already Deployed

**Symptom**: `Error: Program account already exists`

**Solution**:
```bash
# Upgrade existing program
anchor upgrade target/deploy/zeroglaze.so --program-id <program-id>

# Or deploy as new program (generates new ID)
rm -rf target/deploy/zeroglaze-keypair.json
anchor build
anchor deploy
```

---

## Database Issues

### Supabase Connection Fails

**Symptom**: Can't connect to Supabase, health check fails

**Diagnostic**:
```bash
# Test connection
curl -X GET https://xxxxx.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Should return authentication error (that's good!)
# If it returns 404 or timeout, there's an issue
```

**Solutions**:

1. **Check credentials**:
```bash
# Verify in .env file
cat .env | grep SUPABASE

# Should have:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

2. **Verify project is active**:
   - Go to [app.supabase.com](https://app.supabase.com)
   - Check project status
   - Ensure it's not paused

3. **Check Supabase service status**:
   - Visit [status.supabase.com](https://status.supabase.com)

### Migrations Fail

**Symptom**: SQL errors when running migrations

**Solutions**:

1. **Using Supabase CLI**:
```bash
# Check connection
supabase db ping

# If fails, link project again
supabase link --project-ref <your-ref>

# Push migrations
supabase db push
```

2. **Manual migration**:
```sql
-- In Supabase SQL Editor
-- Run migrations one by one
-- Check for errors after each

-- If migration fails halfway:
-- 1. Note which part succeeded
-- 2. Run only the remaining parts
-- 3. Or rollback and start fresh
```

3. **Check for existing tables**:
```sql
-- In SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- If tables exist, you may need to drop them first
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS streamers CASCADE;
-- etc.
```

### RLS Policy Errors

**Symptom**: Can't read/write data even though authenticated

**Solution**:
```sql
-- Check RLS policies
SELECT tablename, policyname FROM pg_policies;

-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE tokens DISABLE ROW LEVEL SECURITY;

-- Re-enable and fix policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Tokens are viewable by everyone"
ON tokens FOR SELECT
USING (true);
```

---

## Frontend Deployment

### Vercel Build Fails

**Symptom**: `npm install` fails on Vercel

**Error**: USB module installation error

**Solution**:
```json
// In vercel.json
{
  "installCommand": "npm install --no-optional"
}
```

**Error**: TypeScript errors

**Solution**:
```bash
# Fix locally first
npm run type-check

# Fix all errors, then push again
git add .
git commit -m "fix: resolve type errors"
git push
```

**Error**: Build timeout

**Solution**:
```json
// In vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 300
      }
    }
  ]
}
```

### Environment Variables Not Available

**Symptom**: `undefined` errors in production, works locally

**Solution**:
```bash
# List current env vars
vercel env ls

# Add missing vars
vercel env add NEXT_PUBLIC_PROGRAM_ID production

# Verify they're set
vercel env ls

# Redeploy
vercel --prod

# Note: NEXT_PUBLIC_ prefix is required for client-side access!
```

### Deployment Succeeds but App Doesn't Work

**Symptom**: App deployed but shows errors

**Diagnostic**:
```bash
# Check logs
vercel logs <deployment-url>

# Check build output
vercel inspect <deployment-url>
```

**Common issues**:

1. **Environment variables not set**:
   - Check Vercel dashboard → Settings → Environment Variables
   - Ensure all required vars are set

2. **API routes not working**:
   - Check app/api/ directory structure
   - Verify route.ts files export GET/POST functions
   - Check Vercel logs for API errors

3. **Static assets not loading**:
   - Verify public/ directory structure
   - Check build output includes assets

### Custom Domain Issues

**Symptom**: Custom domain not working

**Solutions**:

1. **DNS not configured**:
```bash
# Check DNS records
dig your-domain.com

# Should have:
# A record: 76.76.21.21
# CNAME record: cname.vercel-dns.com
```

2. **SSL certificate pending**:
   - Wait 24-48 hours for SSL certificate
   - Check Vercel dashboard for certificate status

3. **Domain not verified**:
   - Go to Vercel → Settings → Domains
   - Click "Verify" next to domain
   - Follow verification steps

---

## CI/CD Issues

### GitHub Actions Workflow Fails

**Symptom**: CI workflow fails on push

**Diagnostic**:
```bash
# Check workflow status
# Go to GitHub → Actions → Failed workflow

# Click on failed job to see logs
```

**Common failures**:

1. **Missing secrets**:
```yaml
# Check required secrets in workflow file
# Add missing secrets in GitHub:
# Settings → Secrets → Actions → New secret
```

2. **Test failures**:
```bash
# Run tests locally first
npm run test
npm run type-check
npm run lint

# Fix issues before pushing
```

3. **Build failures**:
```bash
# Build locally
npm run build

# Fix any errors, then push
```

### Deployment Workflow Succeeds but App Not Updated

**Symptom**: Workflow shows success but changes not live

**Solutions**:

1. **Check Vercel deployment**:
   - Go to Vercel dashboard
   - Check latest deployment
   - Verify it's promoted to production

2. **Cache issue**:
```bash
# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or clear deployment cache
vercel --force
```

3. **Wrong branch deployed**:
   - Check Vercel settings → Git
   - Ensure production is linked to correct branch

### Cron Jobs Not Running

**Symptom**: Scheduled tasks not executing

**Solutions**:

1. **Check cron configuration**:
```json
// In vercel.json
{
  "crons": [{
    "path": "/api/cron/update-stream-status",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
```

2. **Verify cron endpoint**:
```bash
# Test manually
curl -X POST https://your-app.vercel.app/api/cron/update-stream-status \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

3. **Check Vercel logs**:
   - Go to Vercel → Deployments → Functions
   - Check cron function logs

---

## Runtime Errors

### Wallet Connection Fails

**Symptom**: Can't connect Phantom wallet

**Solutions**:

1. **Wrong network**:
   - Ensure wallet is on Devnet
   - In Phantom: Settings → Developer Settings → Change Network → Devnet

2. **Wallet adapter issues**:
```typescript
// Check wallet adapter configuration
// In app/layout.tsx or wallet provider

// Should have:
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
const network = WalletAdapterNetwork.Devnet;
```

3. **Browser console errors**:
   - Open browser console (F12)
   - Check for wallet adapter errors
   - Verify wallet is installed and unlocked

### Transaction Fails

**Symptom**: Transaction submitted but fails

**Diagnostic**:
```bash
# Check transaction in Solana Explorer
# https://explorer.solana.com/?cluster=devnet

# Look for error message
```

**Common errors**:

1. **Insufficient funds**:
```bash
# Check wallet balance
solana balance <wallet-address>

# Request airdrop
solana airdrop 2 <wallet-address>
```

2. **Program account not found**:
   - Verify program is deployed
   - Check NEXT_PUBLIC_PROGRAM_ID is correct
   - Ensure on correct network

3. **Invalid instruction data**:
   - Check IDL matches deployed program
   - Regenerate and redeploy if needed

### API Endpoints Return 500

**Symptom**: API calls fail with 500 errors

**Diagnostic**:
```bash
# Check Vercel logs
vercel logs --follow

# Or in Vercel dashboard → Deployments → Functions → Logs
```

**Common causes**:

1. **Missing environment variables**:
```bash
vercel env ls
# Add any missing vars
```

2. **Database connection error**:
   - Check Supabase credentials
   - Verify database is running
   - Check RLS policies

3. **Unhandled exceptions**:
   - Review API route code
   - Add try-catch blocks
   - Log errors properly

---

## Performance Issues

### Slow Page Load

**Symptom**: Pages take long to load

**Solutions**:

1. **Enable Vercel Analytics**:
   - Vercel Dashboard → Analytics
   - Identify slow pages

2. **Optimize images**:
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={200}
  alt="Logo"
/>
```

3. **Implement caching**:
```typescript
// In API routes
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate'
    }
  });
}
```

### Database Queries Slow

**Symptom**: API responses take seconds

**Solutions**:

1. **Add indexes**:
```sql
-- In Supabase SQL Editor
CREATE INDEX idx_tokens_mint ON tokens(mint);
CREATE INDEX idx_trades_token_id ON trades(token_id);
CREATE INDEX idx_streamers_wallet ON streamers(wallet_address);
```

2. **Optimize queries**:
```typescript
// Select only needed columns
const { data } = await supabase
  .from('tokens')
  .select('mint, name, symbol')  // Instead of '*'
  .limit(10);
```

3. **Enable connection pooling**:
   - Check Supabase dashboard → Database → Connection pooling
   - Use connection pool URL for server-side queries

### High RPC Costs

**Symptom**: Hitting rate limits or high costs

**Solutions**:

1. **Cache RPC responses**:
```typescript
// Cache program account data
const cache = new Map();

async function getAccountData(address: string) {
  if (cache.has(address)) {
    return cache.get(address);
  }

  const data = await connection.getAccountInfo(address);
  cache.set(address, data);
  return data;
}
```

2. **Batch RPC calls**:
```typescript
// Instead of multiple calls
const results = await Promise.all([
  connection.getBalance(address1),
  connection.getBalance(address2),
  connection.getBalance(address3),
]);
```

3. **Use paid RPC provider**:
   - Helius: Better rate limits
   - QuickNode: Faster responses
   - Update SOLANA_RPC_ENDPOINT

---

## Getting Help

If you're still stuck:

1. **Check logs**:
   - Vercel logs: `vercel logs`
   - Supabase logs: Dashboard → Logs
   - Browser console: F12

2. **Search existing issues**:
   - GitHub repository issues
   - Vercel documentation
   - Supabase documentation
   - Solana Stack Exchange

3. **Create detailed bug report**:
   - What you're trying to do
   - What's happening
   - Error messages
   - Steps to reproduce
   - Environment (OS, Node version, etc.)

4. **Community resources**:
   - Solana Discord
   - Anchor Discord
   - Vercel Discord
   - Supabase Discord

---

**Remember**: Most issues are environment-related. Double-check your configuration first!
