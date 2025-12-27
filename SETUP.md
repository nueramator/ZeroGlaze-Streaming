# Zeroglaze MVP - Complete Setup Guide

This guide will walk you through setting up the Zeroglaze MVP from scratch.

## Step 1: Prerequisites

### Install Required Software

1. **Node.js 18+**
   ```bash
   # Check if installed
   node --version

   # If not, download from https://nodejs.org/
   ```

2. **Phantom Wallet**
   - Install browser extension: [https://phantom.app/](https://phantom.app/)
   - Create a new wallet or import existing
   - **IMPORTANT**: Switch to Devnet in Settings

3. **Get Devnet SOL**
   - Visit [https://faucet.solana.com/](https://faucet.solana.com/)
   - Paste your Phantom wallet address
   - Click "Confirm Airdrop"
   - Wait for 1-2 SOL to arrive

## Step 2: Clone and Install

```bash
# Navigate to your projects folder
cd ~/Desktop/Zeroglaze_Project

# Install dependencies
npm install
```

This will install:
- Next.js 14 and React
- Solana wallet adapter
- Supabase client
- Tailwind CSS + DaisyUI
- All other dependencies

## Step 3: Set Up Supabase

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - **Name**: zeroglaze-mvp
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait 2-3 minutes for provisioning

### Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with https://)
   - **anon public** key (long string)

### Run Database Migrations

You have two options:

#### Option A: Using Supabase SQL Editor (Recommended for MVP)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Create another new query
6. Copy contents of `supabase/migrations/002_seed_data.sql`
7. Paste and click **Run**

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

### Verify Database Setup

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - streamers
   - tokens
   - trades
   - stream_status
   - earnings

## Step 4: Configure Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your values:
   ```env
   # REQUIRED: Supabase (from Step 3)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...

   # REQUIRED: Solana
   SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
   SOLANA_NETWORK=devnet

   # OPTIONAL: For full functionality
   NEXT_PUBLIC_PROGRAM_ID=ZERO11111111111111111111111111111111111111111
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   ```

3. **Save the file**

## Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
> zeroglaze@1.0.0 dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - ready in 2.3s
```

## Step 6: Test the Application

### Open in Browser

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. You should see the Zeroglaze homepage

### Test Wallet Connection

1. Click **"Connect Wallet"** in the top right
2. Select **Phantom**
3. Approve the connection
4. You should see your wallet address

### Test Streamer Flow

1. Click **"For Streamers"** or go to `/streamer`
2. Click through the token creation wizard:
   - **Platform**: Select Twitch
   - **Verify**: Enter any username (validation is mocked for MVP)
   - **Details**: Fill in token name, symbol
   - **Options**: Choose freeze authority settings
   - **Confirm**: Review and create
3. Note: Actual blockchain transaction is simulated for MVP

### Test Trading Flow

1. Click **"Trade Tokens"** or go to `/trader`
2. You should see a list of tokens (from seed data)
3. Click on a token
4. Try entering an amount in the trading form
5. See the price quote update
6. Click Buy/Sell (simulated for MVP)

## Step 7: Verify Everything Works

### Checklist

- [ ] Homepage loads correctly
- [ ] Wallet connects successfully
- [ ] Can navigate to Streamer portal
- [ ] Can navigate to Trader portal
- [ ] Token list displays in Trader portal
- [ ] Can select a token and see trading interface
- [ ] Price quotes calculate correctly
- [ ] No console errors (press F12 to check)

## Troubleshooting

### Issue: "Module not found" errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Wallet won't connect

**Solutions**:
1. Make sure Phantom is installed
2. Switch Phantom to Devnet (Settings → Change Network → Devnet)
3. Refresh the page
4. Try a different browser

### Issue: "Failed to fetch" errors

**Solutions**:
1. Check that `.env` has correct Supabase credentials
2. Verify Supabase project is active (check dashboard)
3. Check browser console for specific error messages

### Issue: Page won't load / blank screen

**Solutions**:
1. Check terminal for build errors
2. Ensure port 3000 is not already in use
3. Try `npm run build` to check for TypeScript errors
4. Clear browser cache and reload

### Issue: Database errors

**Solutions**:
1. Verify migrations ran successfully in Supabase SQL Editor
2. Check RLS (Row Level Security) policies are created
3. Test queries directly in Supabase SQL Editor
4. Check API logs in Supabase Dashboard

## Advanced Setup (Optional)

### Set Up Twitch Integration

1. Go to [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
2. Click "Register Your Application"
3. Fill in:
   - **Name**: Zeroglaze MVP
   - **OAuth Redirect URLs**: `http://localhost:3000/api/auth/callback`
   - **Category**: Website Integration
4. Copy Client ID and Client Secret to `.env`

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy Smart Contracts (Advanced)

```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli

# Build program
npm run anchor:build

# Deploy to Devnet
npm run anchor:deploy

# Copy Program ID to .env
```

## Development Workflow

### Making Changes

1. **Frontend changes**: Edit files in `app/` or `components/`
2. **API changes**: Edit files in `app/api/`
3. **Database changes**: Add new migration in `supabase/migrations/`
4. **Styles**: Edit `app/globals.css` or use Tailwind classes

### Testing Changes

1. Save the file
2. Next.js will auto-reload
3. Check browser for changes
4. Check terminal for errors

### Common Commands

```bash
# Start dev server
npm run dev

# Build for production (checks for errors)
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

## Next Steps

Now that setup is complete:

1. **Explore the code**: Start in `app/page.tsx`
2. **Customize**: Change colors in `tailwind.config.ts`
3. **Add features**: See `README.md` for roadmap
4. **Deploy**: Use Vercel for easy deployment

## Getting Help

- **Documentation**: See `README.md` for project overview
- **Backend Docs**: See `README_BACKEND.md` for API details
- **Console Errors**: Press F12 in browser to see errors
- **Logs**: Check terminal where `npm run dev` is running

## Summary

You now have:
- ✅ Working Next.js app
- ✅ Wallet integration (Phantom)
- ✅ Supabase database with seed data
- ✅ Streamer portal (token creation)
- ✅ Trader portal (token discovery and trading)
- ✅ API endpoints for all core functions

Ready to build the future of streamer tokens! 🚀

---

**Need more help?** Check the main `README.md` or review the code comments.
