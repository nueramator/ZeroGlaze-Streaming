# Zeroglaze Frontend Components

This directory contains all the React components for the Zeroglaze MVP. Components are organized by feature and follow a consistent design system using Tailwind CSS.

## Component Structure

```
components/
├── ui/              # Reusable UI primitives
├── wallet/          # Wallet connection & management
├── streamer/        # Streamer-specific features
├── trading/         # Trading & token display
└── layout/          # Page layout components
```

## UI Components (`/ui`)

### Button
Multi-variant button component with loading states.

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" isLoading={false}>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes**: `sm`, `md`, `lg`

### Input
Form input with label, validation, and icon support.

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Amount"
  type="number"
  error={errors.amount}
  leftIcon={<DollarIcon />}
/>
```

### Card
Container component with consistent padding and borders.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card padding="lg" hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Badge
Status indicator component.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success" size="sm">Live</Badge>
```

**Variants**: `default`, `success`, `warning`, `danger`, `info`, `purple`

### Modal
Dialog/overlay component.

```tsx
import { Modal, ModalFooter } from '@/components/ui/Modal';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
  <p>Are you sure?</p>
  <ModalFooter>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

### LoadingSpinner
Loading state indicator.

```tsx
import { LoadingSpinner, PageLoader, ComponentLoader } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" text="Loading..." />
<PageLoader /> // Full page loader
<ComponentLoader /> // Component section loader
```

### Toast
Notification system (uses react-hot-toast).

```tsx
import toast from 'react-hot-toast';

toast.success('Token created!');
toast.error('Transaction failed');
toast.loading('Processing...');
```

### ErrorBoundary
Error handling component.

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Wallet Components (`/wallet`)

### WalletButton
Connect/disconnect wallet button with Phantom branding.

```tsx
import { WalletButton } from '@/components/wallet/WalletButton';

<WalletButton />
```

### WalletInfo
Display connected wallet info and balance.

```tsx
import { WalletInfo } from '@/components/wallet/WalletInfo';

<WalletInfo />
```

### RoleSelector
User role selection (streamer/trader).

```tsx
import { RoleSelector } from '@/components/wallet/RoleSelector';

<RoleSelector
  onRoleSelect={(role) => console.log(role)}
  currentRole="streamer"
/>
```

## Streamer Components (`/streamer`)

### TokenCreationForm
Multi-step token creation wizard.

```tsx
import { TokenCreationForm } from '@/components/streamer/TokenCreationForm';

<TokenCreationForm />
```

**Steps**:
1. Platform selection (Twitch/YouTube/Kick)
2. Username verification
3. Token details (name, symbol, image)
4. Freeze option (green/red flag)
5. Review & confirm

### CreatorDashboard
Creator stats and token management.

```tsx
import { CreatorDashboard } from '@/components/streamer/CreatorDashboard';

<CreatorDashboard />
```

Shows:
- Total tokens created
- Total volume generated
- Total fees earned
- Token list with individual stats

### StreamStatus
Live/offline stream indicator.

```tsx
import { StreamStatus, StreamStatusIndicator } from '@/components/streamer/StreamStatus';

<StreamStatus
  tokenMint="..."
  platform="twitch"
  autoRefresh={true}
/>

<StreamStatusIndicator isLive={true} />
```

## Trading Components (`/trading`)

### TokenCard
Grid item for token display.

```tsx
import { TokenCard } from '@/components/trading/TokenCard';

<TokenCard
  token={tokenData}
  onClick={() => navigate(`/token/${tokenData.tokenMint}`)}
/>
```

### TokenList
Filterable grid of tokens.

```tsx
import { TokenList } from '@/components/trading/TokenList';

<TokenList />
```

**Filters**: All, Live, Trending, Graduated

### TradingInterface
Buy/sell form with live quotes.

```tsx
import { TradingInterface } from '@/components/trading/TradingInterface';

<TradingInterface
  tokenMint="..."
  tokenSymbol="TOKEN"
  currentPrice={0.001}
/>
```

Features:
- Buy/sell toggle
- Amount input with percentage buttons
- Real-time quote calculation
- Fee breakdown
- Price impact warning
- Slippage protection

### PriceChart
Chart.js price visualization.

```tsx
import { PriceChart } from '@/components/trading/PriceChart';

<PriceChart tokenMint="..." timeframe="24H" />
```

**Timeframes**: `1H`, `24H`, `7D`, `30D`

### TradeHistory
Recent trades list.

```tsx
import { TradeHistory } from '@/components/trading/TradeHistory';

<TradeHistory tokenMint="..." limit={20} />
```

### OrderBook
Buy/sell order display (bonding curve visualization).

```tsx
import { OrderBook } from '@/components/trading/OrderBook';

<OrderBook tokenMint="..." />
```

## Layout Components (`/layout`)

### Header
Main navigation bar.

```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

Features:
- Logo and branding
- Navigation links (Explore, Create, Dashboard, Docs)
- Wallet button
- Mobile menu

### Footer
Site footer with links.

```tsx
import { Footer } from '@/components/layout/Footer';

<Footer />
```

### Sidebar
Dashboard sidebar navigation.

```tsx
import { Sidebar } from '@/components/layout/Sidebar';

<Sidebar items={[
  { href: '/dashboard', label: 'Overview', icon: <Icon /> },
  { href: '/tokens', label: 'My Tokens', icon: <Icon /> },
]} />
```

## Utility Functions

### Format Utilities (`/lib/utils/format.ts`)

```tsx
import {
  formatSol,
  formatTokenAmount,
  formatUsd,
  formatPercent,
  formatCompactNumber,
  truncateAddress,
  formatTimeAgo,
  formatDate,
  formatDateTime,
} from '@/lib/utils/format';

formatSol(0.001234); // "0.0012 SOL"
formatTokenAmount(1234567); // "1.23M"
formatUsd(123.45); // "$123.45"
formatPercent(5.67); // "+5.67%"
formatCompactNumber(1500000); // "1.50M"
truncateAddress("ABC...XYZ", 4); // "ABC...XYZ"
formatTimeAgo(new Date()); // "just now"
```

### Class Name Utilities (`/lib/utils/cn.ts`)

```tsx
import { cn } from '@/lib/utils/cn';

<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Design System

### Colors
- **Primary**: Purple gradient (`from-purple-600 to-pink-600`)
- **Background**: Gray-950 (`#0a0a0f`)
- **Surface**: Gray-900
- **Border**: Gray-800
- **Text**: White (primary), Gray-400 (secondary)

### Typography
- **Headings**: Bold, White
- **Body**: Inter font, Gray-300
- **Code/Addresses**: Mono font

### Spacing
- **Card Padding**: `sm` (12px), `md` (16px), `lg` (24px)
- **Section Spacing**: `py-20` (80px)
- **Gap**: `gap-4` (16px), `gap-6` (24px)

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Use Tailwind's responsive prefixes: `md:`, `lg:`, `xl:`

## State Management

Components use:
- **Local State**: `useState` for component-specific state
- **Wallet State**: `useWallet()` from @solana/wallet-adapter-react
- **API Calls**: Direct fetch to `/api/*` endpoints
- **Real-time**: Polling or WebSocket subscriptions (production ready)

## Error Handling

All components include:
- Try/catch blocks for async operations
- Toast notifications for user feedback
- Loading states during async operations
- Empty states for no data
- Error states with retry options

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Color contrast ratios meet WCAG AA

## Performance Optimizations

- React.memo on heavy components (planned)
- Lazy loading for chart libraries
- Virtualization for long lists (planned)
- Image optimization
- Code splitting by route

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When adding new components:
1. Follow existing naming conventions
2. Include TypeScript types
3. Add prop documentation
4. Include loading/error states
5. Make responsive by default
6. Update this README
