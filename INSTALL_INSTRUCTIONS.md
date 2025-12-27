# Zeroglaze MVP - Installation Instructions

Quick fix for npm installation issues and getting the project running.

## Issue: npm install fails with USB/permission errors

**Cause**: Some wallet adapter dependencies try to install optional native modules (USB hardware wallet support) that fail on certain systems.

**Solution**: Install without optional dependencies.

---

## Clean Installation Steps

### 1. Clean Previous Installation

```bash
cd /Users/rohittyagi/Desktop/Zeroglaze_Project

# Remove existing node_modules and lock file
rm -rf node_modules package-lock.json

# Clear npm cache (optional, if issues persist)
npm cache clean --force
```

### 2. Install Dependencies (Method A - Recommended)

```bash
# Install without optional dependencies
npm install --no-optional
```

This skips USB hardware wallet support (not needed for MVP).

### Alternative: Install with Legacy Peer Deps (Method B)

If Method A fails, try:

```bash
npm install --legacy-peer-deps --no-optional
```

### 3. Verify Installation

```bash
# Check if Next.js is installed
npx next --version

# Should output: Next.js v14.1.0 (or similar)
```

If you see the version, installation succeeded!

---

## Start the Development Server

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## If Installation Still Fails

### Option 1: Install Core Dependencies Only

Create a minimal `package.json` for testing:

```bash
# Backup current package.json
cp package.json package.json.backup

# Create minimal version
cat > package.json << 'EOF'
{
  "name": "zeroglaze",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@solana/web3.js": "^1.87.6",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.3.0"
  }
}
EOF

# Install
npm install --no-optional
```

### Option 2: Use Yarn Instead

```bash
# Install yarn globally
npm install -g yarn

# Install dependencies with yarn
yarn install --ignore-optional
```

### Option 3: Use Docker

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-optional
COPY . .
CMD ["npm", "run", "dev"]
EOF

# Build and run
docker build -t zeroglaze .
docker run -p 3000:3000 zeroglaze
```

---

## Post-Installation Checklist

After successful installation, verify these work:

### 1. TypeScript Compiles
```bash
npx tsc --noEmit
# Should complete without errors (warnings are OK)
```

### 2. Next.js Builds
```bash
npm run build
# Should complete successfully
```

### 3. Development Server Starts
```bash
npm run dev
# Should start on http://localhost:3000
```

### 4. Pages Load
- Visit http://localhost:3000
- Visit http://localhost:3000/streamer
- Visit http://localhost:3000/trader

All should load without errors.

---

## Environment Setup (After Installation)

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Set Minimum Required Variables

Edit `.env`:
```env
# Supabase (sign up at supabase.com for free)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...

# Solana (use public endpoint for testing)
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### 3. Set Up Supabase Database

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Run migration files:
   - Copy/paste `supabase/migrations/001_initial_schema.sql`
   - Copy/paste `supabase/migrations/002_seed_data.sql`

### 4. Restart Development Server
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## Troubleshooting Common Issues

### Issue: "Cannot find module 'next'"

**Solution**:
```bash
# Ensure Next.js is installed
npm install next@14.1.0 --save

# Or reinstall everything
rm -rf node_modules
npm install --no-optional
```

### Issue: "Port 3000 already in use"

**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill

# Or use a different port
npm run dev -- -p 3001
```

### Issue: TypeScript errors on build

**Solution**:
```bash
# Install TypeScript types
npm install --save-dev @types/node @types/react @types/react-dom

# Check for errors
npx tsc --noEmit
```

### Issue: Wallet adapter errors

**Solution**:
The wallet adapter works without optional dependencies. If you see warnings about USB/WebUSB, they're safe to ignore for browser-based wallets (Phantom, Solflare).

### Issue: Tailwind CSS not working

**Solution**:
```bash
# Install Tailwind and dependencies
npm install -D tailwindcss postcss autoprefixer

# Restart dev server
npm run dev
```

---

## System Requirements

### Minimum
- Node.js 18.0+
- npm 9.0+
- 2GB RAM
- Modern browser

### Recommended
- Node.js 20.0+
- npm 10.0+
- 4GB RAM
- Chrome/Edge with Phantom wallet

---

## Quick Test After Installation

Run this to verify everything works:

```bash
# From project root
cd /Users/rohittyagi/Desktop/Zeroglaze_Project

# Install
npm install --no-optional

# Verify
npx next --version

# Start
npm run dev

# In another terminal, test API
curl http://localhost:3000/api/tokens/list
```

If you see JSON response, everything is working! ✅

---

## Getting Help

If installation still fails:

1. **Check Node version**: `node --version` (should be 18+)
2. **Check npm version**: `npm --version` (should be 9+)
3. **Check logs**: Look at the full error message
4. **Try with sudo**: `sudo npm install --no-optional` (Mac/Linux)
5. **Use nvm**: Install Node via nvm for better version management

---

## Success! What's Next?

Once installation works:

1. **Read**: [QUICKSTART.md](./QUICKSTART.md) - 5-minute guide
2. **Setup**: Configure `.env` with Supabase credentials
3. **Test**: Run the app and test features
4. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md) when ready

---

**Need more help?** Check [SETUP.md](./SETUP.md) for detailed setup instructions.

**Ready to build?** See [README.md](./README.md) for project overview.
