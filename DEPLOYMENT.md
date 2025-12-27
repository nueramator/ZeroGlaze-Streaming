# Zeroglaze MVP - Deployment Guide

Complete guide for deploying the Zeroglaze MVP to production.

## Pre-Deployment Checklist

### Code Ready
- [ ] All TypeScript errors resolved
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations run successfully
- [ ] API endpoints tested

### Services Configured
- [ ] Supabase project created and configured
- [ ] Vercel account created (for frontend)
- [ ] Twitch app registered (optional)
- [ ] Domain name ready (optional)

## Deployment Steps

### 1. Deploy Database (Supabase)

Supabase is already cloud-hosted, but ensure migrations are applied:

```bash
# Option 1: Via Supabase SQL Editor
# 1. Go to https://app.supabase.com
# 2. Open SQL Editor
# 3. Run migrations/001_initial_schema.sql
# 4. Run migrations/002_seed_data.sql

# Option 2: Via Supabase CLI
npx supabase db push
```

**Verify Database**:
- Tables created: streamers, tokens, trades, stream_status, earnings
- RLS policies enabled
- Seed data inserted (3 test tokens)

### 2. Deploy Frontend (Vercel)

#### Option A: Via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --no-optional`

3. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
   SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
   SOLANA_NETWORK=devnet
   NEXT_PUBLIC_PROGRAM_ID=ZERO11111111111111111111111111111111111111111
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-app.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: zeroglaze-mvp
# - Directory: ./
# - Override settings: No

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all env vars

# Deploy to production
vercel --prod
```

### 3. Configure Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Domains
   - Add your domain (e.g., `zeroglaze.com`)

2. **Update DNS**:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21`

3. **Update Environment**:
   - Update `NEXT_PUBLIC_APP_URL` to your domain
   - Redeploy

### 4. Deploy Smart Contracts (Solana)

#### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
```

#### Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url https://api.devnet.solana.com

# Create/import deployer keypair
solana-keygen new --no-bip39-passphrase -o ~/.config/solana/deployer.json

# Airdrop SOL for deployment
solana airdrop 2

# Build the program
cd programs/zeroglaze
anchor build

# Deploy
anchor deploy

# Save the Program ID shown in output
# Example: ZERO123abc456def789...
```

#### Update Environment Variables

```bash
# Copy Program ID from deployment output
PROGRAM_ID="<your-deployed-program-id>"

# Update Vercel environment
vercel env add NEXT_PUBLIC_PROGRAM_ID production
# Paste the Program ID

# Update local .env
echo "NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID" >> .env
```

### 5. Configure Twitch Webhooks (Optional)

1. **Update Twitch App Settings**:
   - Go to [dev.twitch.tv/console](https://dev.twitch.tv/console/apps)
   - Edit your app
   - OAuth Redirect URLs: Add `https://your-app.vercel.app/api/auth/callback`

2. **Update Webhook Callback**:
   - In `.env`: `TWITCH_WEBHOOK_CALLBACK=https://your-app.vercel.app/api/webhook/stream-status`
   - Update in Vercel dashboard

3. **Test Webhook**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhook/stream-status \
     -H "Content-Type: application/json" \
     -d '{"subscription":{"type":"stream.online"}}'
   ```

## Post-Deployment Verification

### 1. Test Frontend

Visit your deployed URL and verify:
- [ ] Homepage loads correctly
- [ ] Wallet connection works
- [ ] Can navigate to /streamer
- [ ] Can navigate to /trader
- [ ] No console errors

### 2. Test API Endpoints

```bash
BASE_URL="https://your-app.vercel.app"

# Test token list
curl $BASE_URL/api/tokens/list

# Test trading quote
curl -X POST $BASE_URL/api/trading/quote \
  -H "Content-Type: application/json" \
  -d '{"mint":"test","amount":100,"type":"buy"}'
```

### 3. Test Database Connection

- Go to Supabase dashboard
- Check "Database" → "Tables"
- Verify data is accessible
- Check "Logs" for any errors

### 4. Test Wallet Integration

1. Connect Phantom wallet (on Devnet)
2. Try creating a token (streamer flow)
3. Try trading (trader flow)
4. Check browser console for errors
5. Verify transactions in Solana Explorer

## Monitoring & Maintenance

### Vercel Analytics

Enable in Vercel dashboard:
- Analytics → Enable
- Web Vitals monitoring
- Real-time visitor stats

### Supabase Monitoring

Check regularly:
- Database → Usage
- API → Logs
- Auth → User activity (when implemented)

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs

# Configure in next.config.ts
# Add SENTRY_DSN to environment variables
```

### Uptime Monitoring (Optional)

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

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
-- Backup before changes
-- In Supabase SQL Editor:
BEGIN;
-- Make your changes
-- If something breaks:
ROLLBACK;
```

### Smart Contract Updates

**WARNING**: Smart contracts are immutable on Solana. To "rollback":
1. Deploy a new version with fixes
2. Update `NEXT_PUBLIC_PROGRAM_ID`
3. Redeploy frontend

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1s
- Error rate > 1%
- Database CPU > 80%
- API requests approaching limits

### Scaling Options

1. **Vercel**: Automatically scales, upgrade plan if needed
2. **Supabase**: Upgrade to paid plan for:
   - More database connections
   - Better performance
   - Increased API limits
3. **Solana RPC**: Switch to paid RPC provider:
   - Helius
   - QuickNode
   - Alchemy

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Supabase RLS policies enabled
- [ ] API rate limiting configured
- [ ] Webhook secrets validated
- [ ] CORS configured correctly
- [ ] Smart contract audited (before mainnet)

## Common Issues

### Build Fails on Vercel

**Issue**: `npm install` fails with USB module error

**Solution**:
```bash
# In Vercel build settings, use:
npm install --no-optional
```

### Database Connection Errors

**Issue**: Can't connect to Supabase

**Solution**:
1. Check environment variables are set in Vercel
2. Verify Supabase URL and anon key are correct
3. Check Supabase project is active
4. Review API logs in Supabase dashboard

### Wallet Won't Connect

**Issue**: Phantom wallet connection fails

**Solution**:
1. Ensure user is on correct network (Devnet)
2. Check browser console for errors
3. Verify wallet adapter is properly configured
4. Clear browser cache and try again

### Slow Performance

**Issue**: App is slow to load

**Solutions**:
1. Enable Vercel Edge caching
2. Optimize images (use Next.js Image component)
3. Implement code splitting
4. Use Vercel Analytics to identify bottlenecks
5. Consider upgrading Supabase plan

## Environment-Specific Configs

### Development
```env
SOLANA_NETWORK=devnet
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging
```env
SOLANA_NETWORK=devnet
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_APP_URL=https://zeroglaze-staging.vercel.app
```

### Production
```env
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_APP_URL=https://zeroglaze.com
```

## Continuous Deployment

### Auto-Deploy on Push

Vercel automatically deploys:
- **main branch** → Production
- **develop branch** → Preview
- **feature branches** → Preview URLs

### Manual Deploy Trigger

```bash
# Deploy specific branch
vercel --prod

# Deploy with specific commit
git push origin main
# Vercel will auto-deploy
```

## Cost Estimates (Monthly)

### MVP (Free Tier)
- Vercel: $0 (Hobby plan)
- Supabase: $0 (Free tier)
- Solana Devnet: $0
- **Total: $0/month**

### Production (Paid)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Helius RPC: $0-50/month (based on usage)
- Domain: $10-15/year
- **Total: ~$45-100/month**

## Next Steps After Deployment

1. **Add Analytics**: Implement user tracking
2. **Set up Monitoring**: Configure alerts for errors
3. **Security Audit**: Have smart contracts audited
4. **Load Testing**: Test with simulated traffic
5. **User Testing**: Get feedback from real users
6. **Optimize**: Based on analytics data
7. **Iterate**: Ship improvements weekly

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Solana Docs**: [docs.solana.com](https://docs.solana.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Deployment Complete!** 🚀

Your Zeroglaze MVP is now live and ready for users.
