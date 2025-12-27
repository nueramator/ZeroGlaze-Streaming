# Zeroglaze API Reference

Complete API documentation for backend integration.

## Base URL

```
Development: http://localhost:3000
Production: https://zeroglaze.com
```

## Authentication

Most endpoints are public. For authenticated endpoints, include:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

All endpoints return standardized JSON responses:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { ... } // Optional
}
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP/wallet
- **Headers**:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640995200
  ```

---

## Streamer Endpoints

### Create Token

Create a new token with bonding curve.

```http
POST /api/streamer/create-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "tokenName": "My Token",
  "tokenSymbol": "MTK",
  "tokenUri": "https://example.com/metadata.json",
  "creatorWallet": "5xot9P...",
  "creatorTwitter": "username",
  "creatorTwitch": "twitch_username",
  "freezeCreatorAllocation": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenMint": "7xQV8...",
    "bondingCurve": "9xRT2...",
    "transactionSignature": "2xHG5...",
    "tokenId": "uuid-..."
  },
  "message": "Token created successfully"
}
```

**Validation:**
- `tokenName`: 1-32 characters, alphanumeric + spaces
- `tokenSymbol`: 1-10 characters, uppercase alphanumeric
- `tokenUri`: Valid URL, max 200 characters
- `creatorWallet`: Valid Solana address
- `creatorTwitter`: Max 15 characters (optional)
- `creatorTwitch`: Max 25 characters (required)

**Error Codes:**
- `INVALID_INPUT`: Validation failed
- `INVALID_WALLET`: Invalid Solana address
- `TOKEN_ALREADY_EXISTS`: Creator has active token
- `BLOCKCHAIN_ERROR`: Transaction failed

---

### Verify Stream Status

Check if a streamer is currently live.

```http
POST /api/streamer/verify-stream
Content-Type: application/json
```

**Request Body:**
```json
{
  "tokenMint": "7xQV8...",
  "platform": "twitch"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isLive": true,
    "platform": "twitch",
    "viewerCount": 1234,
    "streamTitle": "Gaming Stream",
    "lastChecked": "2024-12-26T10:00:00Z"
  },
  "message": "Stream is live"
}
```

**Platforms:**
- `twitch`: Twitch.tv
- `youtube`: YouTube (MVP: not implemented)

**Error Codes:**
- `TOKEN_NOT_FOUND`: Token doesn't exist
- `EXTERNAL_API_ERROR`: Failed to check stream status

---

### Get Creator Profile

Retrieve creator statistics and token history.

```http
GET /api/streamer/profile?wallet=<address>
```

**Query Parameters:**
- `wallet` (required): Creator's wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "5xot9P...",
    "tokensCreated": 3,
    "graduatedTokens": 1,
    "totalVolume": 245.67,
    "totalFeesEarned": 4.91,
    "tokens": [
      {
        "tokenMint": "7xQV8...",
        "tokenName": "My Token",
        "tokenSymbol": "MTK",
        "currentPrice": 0.00012,
        "marketCap": 120.0,
        "isLive": true,
        "graduated": false,
        "createdAt": "2024-12-25T10:00:00Z"
      }
    ],
    "recentTrades": [...]
  }
}
```

---

## Trading Endpoints

### Buy Tokens

Execute a buy transaction on the bonding curve.

```http
POST /api/trading/buy
Content-Type: application/json
```

**Request Body:**
```json
{
  "tokenMint": "7xQV8...",
  "tokenAmount": 1000000,
  "maxSolCost": 1.05,
  "buyerWallet": "5xot9P..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionSignature": "2xHG5...",
    "tokenAmount": 1000000,
    "solAmount": 1.0,
    "totalFees": 0.03,
    "newPrice": 0.0000011
  },
  "message": "Successfully bought 1000000 tokens"
}
```

**Validation:**
- `tokenAmount`: Positive integer
- `maxSolCost`: Positive number (slippage protection)
- `buyerWallet`: Valid Solana address

**Error Codes:**
- `TOKEN_NOT_FOUND`: Token doesn't exist
- `TOKEN_GRADUATED`: Token moved to DEX
- `SLIPPAGE_EXCEEDED`: Price moved beyond `maxSolCost`
- `INSUFFICIENT_BALANCE`: Not enough SOL
- `INSUFFICIENT_CURVE_SUPPLY`: Not enough tokens in curve

---

### Sell Tokens

Execute a sell transaction on the bonding curve.

```http
POST /api/trading/sell
Content-Type: application/json
```

**Request Body:**
```json
{
  "tokenMint": "7xQV8...",
  "tokenAmount": 500000,
  "minSolOutput": 0.48,
  "sellerWallet": "5xot9P..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionSignature": "2xHG5...",
    "tokenAmount": 500000,
    "solAmount": 0.5,
    "totalFees": 0.015,
    "newPrice": 0.0000009
  },
  "message": "Successfully sold 500000 tokens"
}
```

**Error Codes:**
- `TOKEN_NOT_FOUND`: Token doesn't exist
- `TOKEN_GRADUATED`: Token moved to DEX
- `SLIPPAGE_EXCEEDED`: Price moved below `minSolOutput`
- `INSUFFICIENT_LIQUIDITY`: Not enough SOL in curve

---

### Get Trading Quote

Calculate expected costs/outputs without executing.

```http
POST /api/trading/quote
Content-Type: application/json
```

**Request Body:**
```json
{
  "tokenMint": "7xQV8...",
  "tokenAmount": 1000000,
  "isBuy": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenAmount": 1000000,
    "solAmount": 1.0,
    "platformFee": 0.01,
    "creatorFee": 0.02,
    "totalCost": 1.03,
    "pricePerToken": 0.00000103,
    "priceImpact": 3.5,
    "currentPrice": 0.000001,
    "newPrice": 0.00000103
  }
}
```

**Fields:**
- `priceImpact`: Percentage change in price
- `currentPrice`: Price before trade
- `newPrice`: Price after trade
- `totalCost`: Total SOL required (buy) or received (sell)

---

## Token Endpoints

### List Tokens

Get a paginated list of tokens with filtering and sorting.

```http
GET /api/tokens/list?sort=volume&filter=live&limit=50&offset=0
```

**Query Parameters:**
- `sort` (optional): `volume` | `created` | `price` | `marketcap` (default: `created`)
- `filter` (optional): `all` | `live` | `graduated` | `active` (default: `all`)
- `limit` (optional): 1-100 (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tokenMint": "7xQV8...",
      "tokenName": "My Token",
      "tokenSymbol": "MTK",
      "tokenUri": "https://...",
      "creator": "5xot9P...",
      "currentPrice": 0.00012,
      "marketCap": 120.0,
      "progress": 35,
      "isLive": true,
      "graduated": false,
      "volume24h": 45.67,
      "priceChange24h": 12.5,
      "createdAt": "2024-12-25T10:00:00Z"
    }
  ]
}
```

**Filters:**
- `all`: All tokens
- `live`: Only tokens where streamer is currently live
- `graduated`: Only graduated tokens
- `active`: Only non-graduated tokens

**Sorting:**
- `volume`: 24h trading volume (descending)
- `created`: Creation date (newest first)
- `price`: 24h price change % (highest first)
- `marketcap`: Market capitalization (highest first)

---

### Get Token Details

Get detailed information about a specific token.

```http
GET /api/tokens/{tokenMint}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenMint": "7xQV8...",
    "tokenName": "My Token",
    "tokenSymbol": "MTK",
    "tokenUri": "https://...",
    "creator": "5xot9P...",
    "creatorTwitter": "username",
    "creatorTwitch": "twitch_user",
    "freezeCreatorAllocation": true,
    "currentPrice": 0.00012,
    "marketCap": 120.0,
    "tokensSold": 350000000,
    "totalSupply": 1000000000,
    "progress": 43,
    "isLive": true,
    "graduated": false,
    "totalVolume": 156.78,
    "createdAt": "2024-12-25T10:00:00Z"
  }
}
```

**Fields:**
- `progress`: Percentage sold from bonding curve (0-100%)
- `freezeCreatorAllocation`: If true, shows green flag (anti-rug)
- `totalSupply`: Always 1,000,000,000
- `tokensSold`: Sold from 800M curve supply

---

## Webhook Endpoints

### Stream Status Webhook

Receives stream status updates from Twitch/YouTube EventSub.

```http
POST /api/webhook/stream-status
Content-Type: application/json
X-Webhook-Signature: <HMAC_SHA256>
```

**Request Body:**
```json
{
  "tokenMint": "7xQV8...",
  "platform": "twitch",
  "isLive": true,
  "viewerCount": 1234,
  "streamTitle": "Gaming Stream"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stream status updated"
}
```

**Security:**
- Signature verification required
- HMAC-SHA256 with `WEBHOOK_SECRET`
- Signature format: `sha256=<hex_digest>`

**Error Codes:**
- `UNAUTHORIZED`: Invalid signature
- `TOKEN_NOT_FOUND`: Token doesn't exist

---

## Error Codes Reference

### Client Errors (4xx)

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_INPUT` | 400 | Validation failed |
| `INVALID_WALLET` | 400 | Invalid Solana address |
| `INVALID_TOKEN` | 400 | Invalid token address |
| `INVALID_AMOUNT` | 400 | Invalid trade amount |
| `UNAUTHORIZED` | 401 | Authentication failed |
| `INVALID_SIGNATURE` | 401 | Invalid webhook signature |
| `TOKEN_NOT_FOUND` | 404 | Token doesn't exist |
| `USER_NOT_FOUND` | 404 | User not found |
| `TOKEN_ALREADY_EXISTS` | 409 | Creator has active token |
| `DUPLICATE_TRANSACTION` | 409 | Transaction already processed |
| `INSUFFICIENT_BALANCE` | 422 | Not enough SOL |
| `INSUFFICIENT_LIQUIDITY` | 422 | Not enough liquidity |
| `SLIPPAGE_EXCEEDED` | 422 | Price moved beyond tolerance |
| `TOKEN_GRADUATED` | 422 | Token moved to DEX |
| `TRADE_TOO_SMALL` | 422 | Below minimum trade size |
| `TRADE_TOO_LARGE` | 422 | Above maximum trade size |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Server Errors (5xx)

| Code | HTTP | Description |
|------|------|-------------|
| `INTERNAL_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `BLOCKCHAIN_ERROR` | 500 | Blockchain transaction failed |
| `EXTERNAL_API_ERROR` | 503 | External service unavailable |

---

## WebSocket API (Real-time)

Connect to Supabase Realtime for live updates.

### Token Price Updates

```typescript
import { subscribeToToken } from '@/lib/supabase/client';

const subscription = subscribeToToken(
  '7xQV8...',
  (token) => {
    console.log('Price updated:', token.current_price);
  }
);

// Unsubscribe
subscription.unsubscribe();
```

### New Trades

```typescript
import { subscribeToTrades } from '@/lib/supabase/client';

const subscription = subscribeToTrades(
  '7xQV8...',
  (trade) => {
    console.log('New trade:', trade);
  }
);
```

### Stream Status Changes

```typescript
import { subscribeToStreamStatus } from '@/lib/supabase/client';

const subscription = subscribeToStreamStatus(
  '7xQV8...',
  (isLive) => {
    console.log('Stream status:', isLive ? 'LIVE' : 'OFFLINE');
  }
);
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize
const client = new ZeroglazeClient('https://api.zeroglaze.com');

// Create token
const token = await client.createToken({
  tokenName: 'My Token',
  tokenSymbol: 'MTK',
  tokenUri: 'https://...',
  creatorWallet: '5xot9P...',
  creatorTwitch: 'username',
  freezeCreatorAllocation: true,
});

// Get quote
const quote = await client.getQuote({
  tokenMint: token.tokenMint,
  tokenAmount: 1000000,
  isBuy: true,
});

// Execute buy
const result = await client.buyTokens({
  tokenMint: token.tokenMint,
  tokenAmount: 1000000,
  maxSolCost: quote.totalCost * 1.02, // 2% slippage
  buyerWallet: '5xot9P...',
});
```

### Python

```python
from zeroglaze import ZeroglazeClient

client = ZeroglazeClient('https://api.zeroglaze.com')

# List tokens
tokens = client.list_tokens(
    sort='volume',
    filter='live',
    limit=10
)

# Get token details
token = client.get_token('7xQV8...')

# Check stream status
status = client.verify_stream(
    token_mint='7xQV8...',
    platform='twitch'
)
```

---

## Testing

### Devnet Endpoints

```
Base URL: https://devnet.zeroglaze.com
RPC: https://api.devnet.solana.com
```

### Test Wallets

Use Solana CLI to create test wallets:

```bash
solana-keygen new -o test-wallet.json
solana airdrop 2 <WALLET_ADDRESS> --url devnet
```

### Postman Collection

Import the Postman collection for easy testing:

```bash
curl -o zeroglaze.postman_collection.json \
  https://zeroglaze.com/api/postman
```

---

## Support

- **GitHub Issues**: https://github.com/zeroglaze/zeroglaze/issues
- **Discord**: https://discord.gg/zeroglaze
- **Email**: support@zeroglaze.com

---

**Last Updated**: December 26, 2024
**API Version**: 1.0.0
