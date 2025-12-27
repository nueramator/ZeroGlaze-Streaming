# Zeroglaze Frontend Setup Guide

## Installation

### 1. Install Dependencies

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 2. Required Dependencies

The following packages are required for the frontend components:

**Core Framework:**
- next@14.1.0
- react@^18.2.0
- react-dom@^18.2.0
- typescript@^5

**Solana & Web3:**
- @solana/wallet-adapter-base@^0.9.23
- @solana/wallet-adapter-react@^0.15.35
- @solana/wallet-adapter-react-ui@^0.9.35
- @solana/wallet-adapter-wallets@^0.19.32
- @solana/web3.js@^1.87.6

**UI & Styling:**
- tailwindcss@^3.3.0
- autoprefixer@^10.0.1
- postcss@^8
- clsx
- tailwind-merge

**State & Data:**
- zustand
- @supabase/supabase-js@^2.39.0
- zod@^3.22.4

**UI Components:**
- react-hot-toast
- chart.js
- react-chartjs-2

## Environment Variables

Create a `.env.local` file:

```bash
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twitch API (for stream verification)
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

## Development

```bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

## Build for Production

```bash
# Type check
npm run type-check

# Build
npm run build

# Start production server
npm start
```

## Component Usage

### Basic Page Structure

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function YourPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        {/* Your content */}
      </main>
      <Footer />
    </>
  );
}
```

### Using Wallet Context

```tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/wallet/WalletButton';

export default function Component() {
  const { connected, publicKey } = useWallet();

  return (
    <div>
      {connected ? (
        <p>Connected: {publicKey?.toBase58()}</p>
      ) : (
        <WalletButton />
      )}
    </div>
  );
}
```

### Trading Interface Example

```tsx
import { TradingInterface } from '@/components/trading/TradingInterface';

export default function TokenPage() {
  return (
    <TradingInterface
      tokenMint="YourTokenMintAddress"
      tokenSymbol="TOKEN"
      currentPrice={0.001}
    />
  );
}
```

### Displaying Token List

```tsx
import { TokenList } from '@/components/trading/TokenList';

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Explore Tokens</h1>
      <TokenList />
    </div>
  );
}
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install
```

### Wallet Adapter Styling Issues

Make sure you import the wallet adapter CSS in your root layout:

```tsx
import '@solana/wallet-adapter-react-ui/styles.css';
```

### TypeScript Errors

```bash
# Run type check
npm run type-check

# If persistent, restart TypeScript server in VS Code
# Command Palette -> TypeScript: Restart TS Server
```

## Project Structure

```
app/
├── layout.tsx          # Root layout with providers
├── globals.css         # Global styles
├── page.tsx            # Homepage
├── tokens/             # Token explorer
├── create/             # Token creation
├── dashboard/          # Creator dashboard
└── token/[mint]/       # Token detail pages

components/
├── ui/                 # Reusable UI components
├── wallet/             # Wallet connection
├── streamer/           # Streamer features
├── trading/            # Trading features
└── layout/             # Layout components

lib/
├── contexts/           # React contexts
├── utils/              # Utility functions
├── types/              # TypeScript types
└── supabase/           # Supabase client
```

## API Routes

The frontend expects the following API routes to be available:

```
POST /api/streamer/create-token
POST /api/streamer/verify-stream
GET  /api/streamer/profile?wallet={address}
POST /api/trading/buy
POST /api/trading/sell
POST /api/trading/quote
GET  /api/tokens/list
GET  /api/tokens/[mint]
```

## Testing

### Manual Testing Checklist

- [ ] Wallet connection/disconnection
- [ ] Token creation flow (all steps)
- [ ] Token list loading and filtering
- [ ] Trading interface (buy/sell)
- [ ] Price chart rendering
- [ ] Real-time updates
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari
- Chrome Mobile

## Performance Optimization

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/token-logo.png"
  alt="Token"
  width={64}
  height={64}
  priority
/>
```

### Code Splitting

Components are automatically code-split by Next.js. For additional optimization:

```tsx
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('@/components/trading/PriceChart'), {
  ssr: false,
  loading: () => <ComponentLoader />
});
```

### Caching Strategy

```tsx
// In API routes
export const revalidate = 60; // Revalidate every 60 seconds

// In page components
export const dynamic = 'force-dynamic'; // For real-time data
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

## Security Considerations

1. **Never commit `.env.local`** - Add to .gitignore
2. **Validate user inputs** - All form inputs are validated
3. **Sanitize data** - Use Zod schemas for API responses
4. **RPC rate limiting** - Consider using a private RPC endpoint
5. **Transaction security** - Always confirm transactions with user

## Common Issues

### Phantom Wallet Not Detected

User needs to:
1. Install Phantom wallet extension
2. Refresh the page
3. Click "Connect Wallet"

### Transaction Failures

Check:
- Sufficient SOL balance
- Network congestion
- RPC endpoint status
- Transaction timeout settings

### Real-time Updates Not Working

Verify:
- Supabase connection
- WebSocket support in browser
- Network firewall settings

## Getting Help

1. Check the component README: `/components/README.md`
2. Review the components summary: `/COMPONENTS_SUMMARY.md`
3. Check Next.js docs: https://nextjs.org/docs
4. Check Solana wallet adapter docs: https://github.com/solana-labs/wallet-adapter

## Next Steps

After setup:

1. **Test wallet connection** - Connect Phantom wallet
2. **Browse tokens** - Visit `/tokens` page
3. **Create a token** - Visit `/create` page
4. **Check dashboard** - Visit `/dashboard` page
5. **View token details** - Click on any token

## Production Checklist

Before deploying to production:

- [ ] Update environment variables for mainnet
- [ ] Change RPC endpoint to production
- [ ] Update Supabase to production database
- [ ] Enable proper error logging (Sentry, etc.)
- [ ] Set up analytics (Vercel Analytics, etc.)
- [ ] Configure proper rate limiting
- [ ] Add meta tags for SEO
- [ ] Test on multiple devices
- [ ] Verify all API endpoints work
- [ ] Check security headers
- [ ] Enable HTTPS
- [ ] Set up monitoring/alerts

## Support

For issues specific to:
- **Next.js**: https://nextjs.org/docs
- **Solana**: https://docs.solana.com
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
