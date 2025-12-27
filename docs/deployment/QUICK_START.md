# Quick Start - Deploy in 15 Minutes

Deploy Zeroglaze MVP to production in under 15 minutes.

## Prerequisites

Ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier is fine)
- A Vercel account (free tier is fine)
- A GitHub account

## Step 1: Clone and Setup (2 minutes)

```bash
# Clone repository
git clone <your-repo-url>
cd zeroglaze

# Install dependencies
npm install --no-optional

# Run setup script
./scripts/setup-project.sh
```

Follow the prompts. It will:
- Check prerequisites
- Create `.env` file
- Install dependencies
- Guide you through initial setup

## Step 2: Configure Supabase (3 minutes)

### Create Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - Name: `zeroglaze-mvp`
   - Password: (generate strong password)
   - Region: (closest to your users)
4. Click **Create new project**
5. Wait ~2 minutes for setup

### Run Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Repeat for `002_seed_data.sql`

### Get Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJxxxx...`
3. Update `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Step 3: Deploy Solana Program (4 minutes)

```bash
# Configure Solana for devnet
solana config set --url https://api.devnet.solana.com

# Create wallet (or use existing)
solana-keygen new --no-bip39-passphrase

# Get devnet SOL
solana airdrop 2

# Deploy program
./scripts/deploy-program.sh devnet
```

The script will:
- Build the program
- Deploy to devnet
- Update `.env` with Program ID

Copy the **Program ID** - you'll need it for Vercel.

## Step 4: Deploy to Vercel (5 minutes)

### Install and Login
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

### Deploy
```bash
# Deploy to Vercel
vercel
```

Follow prompts:
- **Set up and deploy**: `Y`
- **Scope**: (your account)
- **Link to existing project**: `N`
- **Project name**: `zeroglaze-mvp`
- **Directory**: `./`
- **Override settings**: `N`

### Add Environment Variables

```bash
# Add Supabase config
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://xxxxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJxxxx...

# Add Solana config
vercel env add SOLANA_RPC_ENDPOINT production
# Paste: https://api.devnet.solana.com

vercel env add SOLANA_NETWORK production
# Paste: devnet

vercel env add NEXT_PUBLIC_PROGRAM_ID production
# Paste: <your-program-id>

# Add security
vercel env add WEBHOOK_SECRET production
# Paste: (run: openssl rand -hex 32)
```

### Deploy to Production
```bash
vercel --prod
```

Your app will be live at: `https://zeroglaze-mvp.vercel.app`

## Step 5: Verify Deployment (1 minute)

### Test Health Check
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "env": { "status": "pass" },
    "database": { "status": "pass" },
    "solana": { "status": "pass" }
  }
}
```

### Test Frontend
1. Visit your deployment URL
2. Click "Connect Wallet"
3. Switch Phantom to Devnet
4. Connect wallet

If wallet connects, you're done!

---

## Next Steps

### Enable Auto-Deploy
```bash
# Connect to GitHub
vercel link

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main

# Vercel will auto-deploy on push!
```

### Set Up Monitoring
1. **Vercel Analytics**:
   - Vercel Dashboard → Analytics → Enable
2. **Uptime Monitoring**:
   - Use [UptimeRobot](https://uptimerobot.com) (free)
   - Monitor: `https://your-app.vercel.app/api/health`

### Configure Custom Domain (Optional)
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Update environment:
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-domain.com
```

---

## Troubleshooting

### Supabase Connection Fails
```bash
# Verify credentials
cat .env | grep SUPABASE

# Test connection
curl https://xxxxx.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

### Program Deployment Fails
```bash
# Check balance
solana balance

# Request more SOL
solana airdrop 2

# Try again
./scripts/deploy-program.sh devnet
```

### Vercel Build Fails
```bash
# Test build locally
npm run build

# Fix errors, then deploy again
vercel --prod
```

### Wallet Won't Connect
1. Ensure Phantom is on Devnet:
   - Settings → Developer Settings → Change Network → Devnet
2. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Check browser console for errors

---

## Common Commands

```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check program status
solana program show <program-id>

# Run database migrations
./scripts/migrate-db.sh

# Validate environment
./scripts/validate-env.sh
```

---

## Cost Breakdown

Everything runs on free tiers:
- **Vercel**: Free (Hobby plan)
- **Supabase**: Free (500MB database, 2GB storage)
- **Solana Devnet**: Free
- **GitHub**: Free

**Total cost**: $0/month

---

## What's Deployed?

Your MVP now has:
- ✅ Frontend on Vercel (Next.js)
- ✅ Database on Supabase (PostgreSQL)
- ✅ Smart contract on Solana Devnet
- ✅ Health monitoring endpoint
- ✅ API routes for trading
- ✅ Wallet integration
- ✅ Automatic deployments (when connected to GitHub)

---

## Need Help?

Full documentation:
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [GitHub Secrets](./GITHUB_SECRETS.md)

Support:
- Check [Issues](../../issues) on GitHub
- Review error logs: `vercel logs`
- Test locally: `npm run dev`

---

**Congratulations!** Your Zeroglaze MVP is live on Solana Devnet. 🚀
