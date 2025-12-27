# Component Quick Reference

Quick copy-paste examples for all Zeroglaze components.

## UI Components

### Button
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" isLoading={false} onClick={handleClick}>
  Click Me
</Button>

// Variants: primary | secondary | outline | ghost | danger
// Sizes: sm | md | lg
```

### Input
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Token Amount"
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  error={errors?.amount}
  helperText="Enter amount to trade"
  placeholder="0.00"
/>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card padding="lg" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Live</Badge>
// Variants: default | success | warning | danger | info | purple
```

### Modal
```tsx
import { Modal, ModalFooter } from '@/components/ui/Modal';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Trade">
  <p>Are you sure you want to proceed?</p>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

### Loading
```tsx
import { LoadingSpinner, PageLoader, ComponentLoader } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" text="Loading..." />
<PageLoader /> // Full page
<ComponentLoader /> // Section
```

### Toast
```tsx
import toast from 'react-hot-toast';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');

// Custom duration
toast('Message', { duration: 4000 });
```

## Wallet Components

### Wallet Button
```tsx
import { WalletButton } from '@/components/wallet/WalletButton';

<WalletButton />
// Handles connect/disconnect automatically
```

### Wallet Info
```tsx
import { WalletInfo } from '@/components/wallet/WalletInfo';

<WalletInfo />
// Shows address and balance
```

### Role Selector
```tsx
import { RoleSelector } from '@/components/wallet/RoleSelector';

<RoleSelector
  onRoleSelect={(role) => console.log('Selected:', role)}
  currentRole="streamer"
/>
```

## Streamer Components

### Token Creation Form
```tsx
import { TokenCreationForm } from '@/components/streamer/TokenCreationForm';

<TokenCreationForm />
// 5-step wizard, handles everything internally
```

### Creator Dashboard
```tsx
import { CreatorDashboard } from '@/components/streamer/CreatorDashboard';

<CreatorDashboard />
// Fetches data for connected wallet
```

### Stream Status
```tsx
import { StreamStatus, StreamStatusIndicator } from '@/components/streamer/StreamStatus';

<StreamStatus
  tokenMint="ABC123..."
  platform="twitch"
  autoRefresh={true}
/>

<StreamStatusIndicator isLive={true} />
```

## Trading Components

### Token Card
```tsx
import { TokenCard } from '@/components/trading/TokenCard';

<TokenCard
  token={tokenData}
  onClick={() => router.push(`/token/${tokenData.tokenMint}`)}
/>
```

### Token List
```tsx
import { TokenList } from '@/components/trading/TokenList';

<TokenList />
// Includes filters and pagination
```

### Trading Interface
```tsx
import { TradingInterface } from '@/components/trading/TradingInterface';

<TradingInterface
  tokenMint="ABC123..."
  tokenSymbol="TOKEN"
  currentPrice={0.001}
/>
```

### Price Chart
```tsx
import { PriceChart } from '@/components/trading/PriceChart';

<PriceChart tokenMint="ABC123..." timeframe="24H" />
// Timeframes: 1H | 24H | 7D | 30D
```

### Trade History
```tsx
import { TradeHistory } from '@/components/trading/TradeHistory';

<TradeHistory tokenMint="ABC123..." limit={20} />
```

### Order Book
```tsx
import { OrderBook } from '@/components/trading/OrderBook';

<OrderBook tokenMint="ABC123..." />
```

## Layout Components

### Header
```tsx
import { Header } from '@/components/layout/Header';

<Header />
// Sticky navigation with wallet button
```

### Footer
```tsx
import { Footer } from '@/components/layout/Footer';

<Footer />
// Site footer with links
```

### Sidebar
```tsx
import { Sidebar } from '@/components/layout/Sidebar';

<Sidebar items={[
  { href: '/dashboard', label: 'Dashboard', icon: <Icon /> },
  { href: '/tokens', label: 'Tokens', icon: <Icon /> },
]} />
```

## Utility Functions

### Formatting
```tsx
import {
  formatSol,
  formatTokenAmount,
  formatUsd,
  formatPercent,
  formatCompactNumber,
  truncateAddress,
  formatTimeAgo
} from '@/lib/utils/format';

formatSol(0.001234)              // "0.0012 SOL"
formatTokenAmount(1234567)        // "1.23M"
formatUsd(123.45)                 // "$123.45"
formatPercent(5.67)               // "+5.67%"
formatCompactNumber(1500000)      // "1.50M"
truncateAddress("ABC...XYZ", 4)   // "ABC...XYZ"
formatTimeAgo(new Date())         // "just now"
```

### Class Names
```tsx
import { cn } from '@/lib/utils/cn';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

## Hooks

### Wallet Hook
```tsx
import { useWallet } from '@solana/wallet-adapter-react';

const { connected, publicKey, disconnect } = useWallet();

if (connected) {
  console.log(publicKey?.toBase58());
}
```

### Connection Hook
```tsx
import { useConnection } from '@solana/wallet-adapter-react';

const { connection } = useConnection();
const balance = await connection.getBalance(publicKey);
```

## Page Templates

### Basic Page
```tsx
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function YourPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-white mb-8">
            Page Title
          </h1>
          {/* Your content */}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

### Page with Wallet Protection
```tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WalletButton } from '@/components/wallet/WalletButton';

export default function ProtectedPage() {
  const { connected } = useWallet();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          {connected ? (
            <div>
              {/* Protected content */}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">
                Connect Your Wallet
              </h2>
              <WalletButton />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

### Grid Layout Page
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Two Column Layout
```tsx
<div className="grid lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">
    {/* Sidebar */}
  </div>
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
</div>
```

## Common Patterns

### Async Data Fetching
```tsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/endpoint');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

if (isLoading) return <ComponentLoader />;
if (error) return <div>Error: {error}</div>;
```

### Form Handling
```tsx
const [formData, setFormData] = useState({ name: '', amount: '' });
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  const newErrors = {};
  if (!formData.name) newErrors.name = 'Name is required';
  if (!formData.amount) newErrors.amount = 'Amount is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    setIsSubmitting(true);
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Success!');
      setFormData({ name: '', amount: '' });
    } else {
      toast.error(data.error);
    }
  } catch (error) {
    toast.error('Submission failed');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Modal State
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<Button onClick={() => setIsModalOpen(true)}>
  Open Modal
</Button>

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Modal Title"
>
  Modal content
</Modal>
```

## Styling Patterns

### Gradient Text
```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Gradient Background
```tsx
<div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl">
  Content
</div>
```

### Card with Hover
```tsx
<div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-all cursor-pointer">
  Hoverable Card
</div>
```

### Responsive Container
```tsx
<div className="container mx-auto px-4 py-12">
  <div className="max-w-4xl mx-auto">
    Content
  </div>
</div>
```

### Flex Layouts
```tsx
// Horizontal
<div className="flex items-center gap-4">
  <Item1 />
  <Item2 />
</div>

// Vertical
<div className="flex flex-col gap-4">
  <Item1 />
  <Item2 />
</div>

// Space Between
<div className="flex items-center justify-between">
  <Left />
  <Right />
</div>
```

## Common Tailwind Classes

```
// Spacing
gap-4, gap-6, gap-8
p-4, p-6, p-12
py-4, px-4
mb-4, mt-8

// Colors
bg-gray-950, bg-gray-900
text-white, text-gray-400
border-gray-800

// Sizing
w-full, h-full
max-w-4xl, max-w-6xl
min-h-screen

// Typography
text-4xl, text-2xl
font-bold, font-semibold
text-center, text-left

// Borders
rounded-lg, rounded-xl
border, border-2

// Effects
hover:bg-gray-800
transition-all
shadow-lg
```
