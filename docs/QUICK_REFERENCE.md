# Zeroglaze Quick Reference Guide

**For when you need answers fast while coding.**

---

## Constants & Configuration

### Bonding Curve (Linear - MVP)

```typescript
const BASE_PRICE = 0.00000001;  // SOL per token
const SLOPE = 0.0000000001;     // Price increase per token
const TOTAL_SUPPLY = 1_000_000_000;
const CURVE_SUPPLY = 800_000_000;
const CREATOR_SUPPLY = 200_000_000;
```

### Fees

```typescript
const PLATFORM_FEE = 1.0%;      // Always charged
const CREATOR_FEE_LIVE = 2.0%;  // When streaming
const CREATOR_FEE_OFFLINE = 0.2%; // When offline
```

### Environment Variables

```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YourProgramIDHere
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_secret
PLATFORM_WALLET_ADDRESS=your_wallet_here
```

---

## Common Commands

### Solana

```bash
# Set network to devnet
solana config set --url devnet

# Check balance
solana balance

# Get airdrop (2 SOL)
solana airdrop 2

# Check transaction
solana confirm <SIGNATURE>
```

### Anchor

```bash
# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test

# Upgrade program
anchor upgrade --program-id <ID> --provider.cluster devnet

# Get program ID
solana address -k target/deploy/zeroglaze-keypair.json
```

### Next.js

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### Vercel

```bash
# Deploy to production
vercel --prod

# Set environment variable
vercel env add VARIABLE_NAME

# View logs
vercel logs
```

---

## Database Queries

### Insert Token

```typescript
const { data, error } = await supabase
  .from('tokens')
  .insert({
    address: tokenAddress,
    creator_wallet: walletAddress,
    name: tokenName,
    ticker: tokenTicker,
    thumbnail_url: imageUrl,
    streamer_username: username,
    platform: 'twitch',
    current_price: 0.00000001,
  })
  .select()
  .single();
```

### Get All Tokens

```typescript
const { data, error } = await supabase
  .from('tokens')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get Token by Address

```typescript
const { data, error } = await supabase
  .from('tokens')
  .select('*')
  .eq('address', tokenAddress)
  .single();
```

### Check if Wallet Has Token

```typescript
const { data, error } = await supabase
  .from('tokens')
  .select('id')
  .eq('creator_wallet', walletAddress)
  .single();

if (data) {
  // Wallet already has a token
}
```

### Insert Trade

```typescript
const { data, error } = await supabase
  .from('trades')
  .insert({
    token_address: tokenAddress,
    trader_wallet: traderWallet,
    type: 'buy', // or 'sell'
    token_amount: amount,
    sol_amount: solAmount,
    price: currentPrice,
    platform_fee: platformFee,
    creator_fee: creatorFee,
    was_live: isLive,
    tx_signature: signature,
  });
```

### Get Recent Trades

```typescript
const { data, error } = await supabase
  .from('trades')
  .select('*')
  .eq('token_address', tokenAddress)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Update Stream Status

```typescript
const { data, error } = await supabase
  .from('tokens')
  .update({
    is_live: isLive,
    last_checked_at: new Date().toISOString(),
  })
  .eq('address', tokenAddress);
```

---

## Solana Transactions

### Create Connection

```typescript
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
  'confirmed'
);
```

### Get Wallet Adapter

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, signTransaction, sendTransaction } = useWallet();
```

### Build Transaction

```typescript
import { Transaction, SystemProgram } from '@solana/web3.js';

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: receiver,
    lamports: amount,
  })
);

// Add more instructions...
```

### Sign and Send

```typescript
const signature = await sendTransaction(transaction, connection);
await connection.confirmTransaction(signature, 'confirmed');
```

---

## Twitch API

### Get Access Token

```typescript
const response = await fetch(
  `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
  { method: 'POST' }
);
const { access_token } = await response.json();
```

### Check Stream Status

```typescript
// Get user ID
const userResponse = await fetch(
  `https://api.twitch.tv/helix/users?login=${username}`,
  {
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);
const { data: users } = await userResponse.json();
const userId = users[0].id;

// Check stream
const streamResponse = await fetch(
  `https://api.twitch.tv/helix/streams?user_id=${userId}`,
  {
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);
const { data: streams } = await streamResponse.json();
const isLive = streams.length > 0;
```

---

## Bonding Curve Calculations

### Calculate Price

```typescript
function calculatePrice(tokensSold: number): number {
  return BASE_PRICE + (SLOPE * tokensSold);
}
```

### Calculate Buy Cost

```typescript
function calculateBuyCost(
  currentTokensSold: number,
  tokensToBuy: number,
  isLive: boolean
) {
  // Average price (trapezoidal rule)
  const startPrice = calculatePrice(currentTokensSold);
  const endPrice = calculatePrice(currentTokensSold + tokensToBuy);
  const avgPrice = (startPrice + endPrice) / 2;

  const solCost = avgPrice * tokensToBuy;

  // Fees
  const platformFee = solCost * 0.01;
  const creatorFee = solCost * (isLive ? 0.02 : 0.002);
  const total = solCost + platformFee + creatorFee;

  return { solCost, platformFee, creatorFee, total };
}
```

### Calculate Sell Proceeds

```typescript
function calculateSellProceeds(
  currentTokensSold: number,
  tokensToSell: number,
  isLive: boolean
) {
  // Selling moves backwards on curve
  const startPrice = calculatePrice(currentTokensSold - tokensToSell);
  const endPrice = calculatePrice(currentTokensSold);
  const avgPrice = (startPrice + endPrice) / 2;

  const solReceived = avgPrice * tokensToSell;

  // Fees
  const platformFee = solReceived * 0.01;
  const creatorFee = solReceived * (isLive ? 0.02 : 0.002);
  const total = solReceived - platformFee - creatorFee;

  return { solReceived, platformFee, creatorFee, total };
}
```

### Calculate Market Cap

```typescript
function calculateMarketCap(tokensSold: number): number {
  const currentPrice = calculatePrice(tokensSold);
  return currentPrice * TOTAL_SUPPLY;
}
```

---

## React Hooks

### Use Wallet

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, connected, signTransaction } = useWallet();
```

### Use Realtime (Supabase)

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`token:${tokenAddress}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tokens',
        filter: `address=eq.${tokenAddress}`,
      },
      (payload) => {
        setTokenData(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [tokenAddress]);
```

---

## Error Handling

### Common Errors

```typescript
// Wallet not connected
if (!publicKey) {
  throw new Error('Please connect your wallet');
}

// Insufficient balance
if (balance < cost) {
  throw new Error('Insufficient SOL balance');
}

// Transaction failed
try {
  const signature = await sendTransaction(tx, connection);
  await connection.confirmTransaction(signature);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    throw new Error('Insufficient SOL for transaction');
  }
  throw error;
}

// Network error
if (error.message.includes('Network')) {
  throw new Error('Network error. Please check your connection.');
}
```

---

## Debugging

### Check Solana Transaction

```bash
solana confirm <SIGNATURE>
# or
# Visit: https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

### Check Program Logs

```bash
solana logs <PROGRAM_ID>
```

### Check Account Data

```bash
solana account <ADDRESS>
```

### Console Logging (Frontend)

```typescript
console.log('Wallet:', publicKey?.toBase58());
console.log('Transaction:', signature);
console.log('Token Data:', tokenData);
```

### Anchor Logs (Smart Contract)

```rust
msg!("Creating token with name: {}", name);
msg!("Tokens sold: {}", token_data.tokens_sold);
msg!("Price: {}", price);
```

---

## Testing Checklist

### Manual Testing Flow

**Streamer**:
1. Connect wallet (Phantom on devnet)
2. Go to /create
3. Fill form (name, ticker, username, image)
4. Submit (wait for confirmation)
5. Check wallet for tokens (200M)
6. Check /discover for token card
7. Start Twitch stream
8. Wait 60s, check live indicator

**Trader**:
1. Connect wallet (different wallet)
2. Go to /discover
3. Click token
4. Buy 1M tokens
5. See balance update
6. See price increase
7. Sell 500K tokens
8. See SOL received

**Both**:
1. Check Solana Explorer for transactions
2. Check Supabase for database records
3. Check console for errors

---

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={thumbnailUrl}
  alt={tokenName}
  width={200}
  height={200}
  className="rounded-lg"
/>
```

### Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const PriceChart = dynamic(() => import('@/components/trading/PriceChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});
```

### Debouncing

```typescript
import { useState, useEffect } from 'react';

const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedValue(value);
  }, 500);

  return () => {
    clearTimeout(handler);
  };
}, [value]);
```

---

## Styling (Tailwind + DaisyUI)

### Common Classes

```html
<!-- Button -->
<button className="btn btn-primary">Buy Tokens</button>

<!-- Card -->
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Token Name</h2>
    <p>Description</p>
  </div>
</div>

<!-- Input -->
<input
  type="text"
  placeholder="Amount"
  className="input input-bordered w-full"
/>

<!-- Alert -->
<div className="alert alert-success">
  <span>Success message</span>
</div>

<!-- Badge -->
<div className="badge badge-primary">LIVE</div>

<!-- Loading -->
<span className="loading loading-spinner loading-lg"></span>
```

### Responsive Grid

```html
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Token cards -->
</div>
```

---

## Git Workflow

```bash
# Start new feature
git checkout -b feature/token-creation

# Commit changes
git add .
git commit -m "Add token creation UI"

# Push to remote
git push origin feature/token-creation

# Merge to main
git checkout main
git merge feature/token-creation
git push origin main
```

---

## Deployment

### Vercel Deploy

```bash
# First time
vercel

# Production
vercel --prod

# Environment variables
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
vercel env add TWITCH_CLIENT_ID production
# ... etc
```

### Anchor Deploy

```bash
# Build
anchor build

# Deploy (first time)
anchor deploy --provider.cluster devnet

# Upgrade
anchor upgrade --program-id <ID> --provider.cluster devnet
```

---

## Useful Links

- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Anchor Docs**: https://book.anchor-lang.com
- **Solana Docs**: https://docs.solana.com
- **Supabase Docs**: https://supabase.com/docs
- **Twitch API**: https://dev.twitch.tv/docs/api
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **DaisyUI Components**: https://daisyui.com/components

---

## Emergency Fixes

### "Program not found" error
```bash
# Rebuild and redeploy
anchor build
anchor deploy --provider.cluster devnet
# Update NEXT_PUBLIC_PROGRAM_ID in .env.local
```

### "Wallet not connected" error
```typescript
// Add wallet check
if (!publicKey) {
  alert('Please connect your wallet');
  return;
}
```

### "Insufficient funds" error
```bash
# Get more devnet SOL
solana airdrop 2
```

### Database connection fails
```bash
# Check .env.local has correct values
# Restart dev server
npm run dev
```

### Real-time not updating
```typescript
// Check subscription is active
console.log('Channel status:', channel.state);

// Manually refetch as fallback
const { data } = await supabase.from('tokens').select('*');
```

---

## Code Snippets

### Toast Notification

```typescript
// Install: npm install react-hot-toast
import toast from 'react-hot-toast';

toast.success('Token created!');
toast.error('Transaction failed');
toast.loading('Processing...');
```

### Copy to Clipboard

```typescript
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard!');
};
```

### Format Numbers

```typescript
// Format SOL amount
const formatSOL = (amount: number) => {
  return amount.toFixed(6) + ' SOL';
};

// Format large numbers
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
};

// Example: 1234567 → "1.23M"
```

### Truncate Address

```typescript
const truncateAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Example: "7xY9...3kL2"
```

---

**Keep this document open while coding for quick answers!**

---

**Last Updated**: December 26, 2024
