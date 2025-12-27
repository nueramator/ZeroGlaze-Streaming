# Zeroglaze MVP - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
cd /Users/rohittyagi/Desktop/Zeroglaze_Project
npm install --no-optional
```

> **Note**: Using `--no-optional` avoids USB module issues with wallet adapters

## Step 2: Set Up Environment (1 minute)

Create your `.env` file:

```bash
cp .env.example .env
```

**Minimum required** (uses defaults):
```env
# Supabase (create free account at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Solana (using public Devnet endpoint)
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### Quick Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create new project → Wait 2 minutes
3. Go to Settings → API → Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Go to SQL Editor → New Query
5. Copy/paste content from `supabase/migrations/001_initial_schema.sql` → Run
6. New Query → Copy/paste `supabase/migrations/002_seed_data.sql` → Run

## Step 3: Start Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Connect Wallet (1 minute)

1. Install Phantom wallet: [phantom.app](https://phantom.app)
2. Create/import wallet
3. **IMPORTANT**: Settings → Change Network → **Devnet**
4. Get Devnet SOL: [faucet.solana.com](https://faucet.solana.com)
5. Click "Connect Wallet" on Zeroglaze

## Step 5: Test the App (1 minute)

### Try Streamer Flow
1. Click "For Streamers" or go to `/streamer`
2. Click through the wizard (all fields are optional for testing)
3. See simulated token creation

### Try Trading Flow
1. Click "Trade Tokens" or go to `/trader`
2. Select a token from the list (seed data)
3. Enter amount → See price quote
4. Click Buy/Sell (simulated)

---

## You're Done!

The MVP is running locally. Now you can:

- Explore the code in your editor
- Customize the UI/design
- Add features
- Deploy to Vercel

## Next Steps

### To Deploy
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide

Quick deploy to Vercel:
```bash
npm install -g vercel
vercel
```

### To Build for Production
```bash
npm run build
npm start
```

### To Add Real Blockchain Transactions
See [README_BACKEND.md](./README_BACKEND.md) for smart contract setup

---

## Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install --no-optional
```

### Wallet won't connect
- Make sure Phantom is on **Devnet** (Settings → Change Network)
- Refresh the page
- Try incognito mode

### Database errors
- Verify `.env` has correct Supabase credentials
- Check migrations ran successfully in Supabase SQL Editor
- Restart dev server: Stop (Ctrl+C) → `npm run dev`

### Port 3000 already in use
```bash
# Kill existing process
lsof -ti:3000 | xargs kill

# Or use different port
npm run dev -- -p 3001
```

---

## Project Structure (Quick Reference)

```
app/
├── page.tsx           # Homepage
├── streamer/         # Token creation
├── trader/           # Trading interface
└── api/              # Backend endpoints

components/
├── streamer/         # Streamer UI
├── trader/          # Trading UI
└── providers/       # Wallet setup

lib/
├── solana/          # Blockchain logic
├── supabase/        # Database
└── utils/           # Bonding curve, etc
```

---

## Documentation Links

- **Full Documentation**: [README.md](./README.md)
- **Setup Guide**: [SETUP.md](./SETUP.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Backend Architecture**: [README_BACKEND.md](./README_BACKEND.md)
- **MVP Summary**: [MVP_SUMMARY.md](./MVP_SUMMARY.md)

---

**Happy Building!** 🚀

Questions? Check the docs or review the code comments.
