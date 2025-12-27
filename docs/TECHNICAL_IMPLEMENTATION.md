# Zeroglaze MVP - Technical Implementation Guide

**Purpose**: Detailed technical specifications and code examples for implementing the 6-day sprint.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Database Schema](#database-schema)
3. [Smart Contract Architecture](#smart-contract-architecture)
4. [API Routes](#api-routes)
5. [Frontend Components](#frontend-components)
6. [Bonding Curve Math](#bonding-curve-math)
7. [Real-time Updates](#real-time-updates)
8. [Deployment Checklist](#deployment-checklist)

---

## Project Structure

```
zeroglaze/
├── programs/                    # Solana smart contracts (Anchor)
│   └── zeroglaze/
│       ├── src/
│       │   ├── lib.rs          # Program entrypoint
│       │   ├── state.rs        # Account structures
│       │   ├── instructions/
│       │   │   ├── create_token.rs
│       │   │   ├── buy_tokens.rs
│       │   │   └── sell_tokens.rs
│       │   └── errors.rs       # Custom errors
│       └── Cargo.toml
├── app/                        # Next.js app directory
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── create/
│   │   └── page.tsx            # Token creation
│   ├── trade/
│   │   └── [address]/
│   │       └── page.tsx        # Trading interface
│   ├── discover/
│   │   └── page.tsx            # Token discovery
│   └── api/
│       ├── tokens/
│       │   ├── create/route.ts
│       │   └── list/route.ts
│       ├── trades/
│       │   └── history/route.ts
│       └── twitch/
│           └── stream-status/route.ts
├── components/
│   ├── wallet/
│   │   └── WalletButton.tsx
│   ├── trading/
│   │   ├── BuyPanel.tsx
│   │   ├── SellPanel.tsx
│   │   └── PriceChart.tsx
│   ├── tokens/
│   │   ├── TokenCard.tsx
│   │   └── TokenList.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── lib/
│   ├── solana.ts               # Solana connection utils
│   ├── supabase.ts             # Supabase client
│   ├── bonding-curve.ts        # Price calculation
│   └── twitch.ts               # Twitch API client
├── hooks/
│   ├── useWallet.ts
│   ├── useTokens.ts
│   └── useRealtime.ts
├── types/
│   └── index.ts                # TypeScript types
├── Anchor.toml                 # Anchor config
├── package.json
└── .env.local
```

---

## Database Schema

### Supabase Tables

```sql
-- Users table (auto-created by Supabase Auth, extended)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'trader', -- 'streamer' or 'trader'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens table
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL, -- SPL token mint address
  creator_wallet TEXT NOT NULL REFERENCES users(wallet_address),
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Stream info
  platform TEXT DEFAULT 'twitch',
  streamer_username TEXT NOT NULL,
  is_live BOOLEAN DEFAULT FALSE,
  last_checked_at TIMESTAMPTZ,

  -- Tokenomics
  total_supply BIGINT DEFAULT 1000000000,
  tokens_sold BIGINT DEFAULT 0,
  current_price DECIMAL(20, 10) DEFAULT 0,
  market_cap DECIMAL(20, 4) DEFAULT 0,

  -- Stats
  volume_24h DECIMAL(20, 4) DEFAULT 0,
  trades_count INT DEFAULT 0,
  holders_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_address TEXT NOT NULL REFERENCES tokens(address),
  trader_wallet TEXT NOT NULL,

  type TEXT NOT NULL, -- 'buy' or 'sell'
  token_amount BIGINT NOT NULL,
  sol_amount DECIMAL(20, 10) NOT NULL,
  price DECIMAL(20, 10) NOT NULL,

  -- Fees
  platform_fee DECIMAL(20, 10) NOT NULL,
  creator_fee DECIMAL(20, 10) NOT NULL,
  was_live BOOLEAN NOT NULL,

  tx_signature TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream status log (for monitoring)
CREATE TABLE stream_status_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_address TEXT NOT NULL REFERENCES tokens(address),
  is_live BOOLEAN NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tokens_creator ON tokens(creator_wallet);
CREATE INDEX idx_tokens_live ON tokens(is_live);
CREATE INDEX idx_trades_token ON trades(token_address);
CREATE INDEX idx_trades_trader ON trades(trader_wallet);
CREATE INDEX idx_trades_created ON trades(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policies (everyone can read, only creator can update their token)
CREATE POLICY "Tokens are viewable by everyone"
  ON tokens FOR SELECT
  USING (true);

CREATE POLICY "Creators can update their tokens"
  ON tokens FOR UPDATE
  USING (creator_wallet = current_user);

CREATE POLICY "Trades are viewable by everyone"
  ON trades FOR SELECT
  USING (true);
```

### Supabase Realtime Setup

```sql
-- Enable realtime on specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
```

---

## Smart Contract Architecture

### Anchor Program Structure

**File**: `programs/zeroglaze/src/lib.rs`

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};

declare_id!("YourProgramIDHere");

#[program]
pub mod zeroglaze {
    use super::*;

    // Initialize the platform (one-time setup)
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.platform_wallet = ctx.accounts.platform_wallet.key();
        platform.total_fees_collected = 0;
        Ok(())
    }

    // Create a new token
    pub fn create_token(
        ctx: Context<CreateToken>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        token_data.creator = ctx.accounts.creator.key();
        token_data.mint = ctx.accounts.mint.key();
        token_data.tokens_sold = 0;
        token_data.total_supply = 1_000_000_000; // 1 billion
        token_data.curve_supply = 800_000_000; // 800M tradeable
        token_data.creator_supply = 200_000_000; // 200M to creator
        token_data.is_live = false;

        // Mint creator tokens
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, token_data.creator_supply)?;

        Ok(())
    }

    // Buy tokens
    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        amount: u64,
        is_live: bool,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;

        // Calculate price and fees
        let (sol_cost, platform_fee, creator_fee) =
            calculate_buy_cost(token_data.tokens_sold, amount, is_live)?;

        let total_cost = sol_cost + platform_fee + creator_fee;

        // Transfer SOL from buyer to escrow
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.escrow.key(),
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
            ],
        )?;

        // Distribute fees
        // Platform fee
        let transfer_platform = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.escrow.key(),
            &ctx.accounts.platform_wallet.key(),
            platform_fee,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_platform,
            &[
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.platform_wallet.to_account_info(),
            ],
            &[],
        )?;

        // Creator fee
        let transfer_creator = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.escrow.key(),
            &ctx.accounts.creator.key(),
            creator_fee,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_creator,
            &[
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.creator.to_account_info(),
            ],
            &[],
        )?;

        // Mint tokens to buyer
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        // Update token data
        token_data.tokens_sold += amount;

        Ok(())
    }

    // Sell tokens
    pub fn sell_tokens(
        ctx: Context<SellTokens>,
        amount: u64,
        is_live: bool,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;

        // Calculate price and fees
        let (sol_received, platform_fee, creator_fee) =
            calculate_sell_proceeds(token_data.tokens_sold, amount, is_live)?;

        let total_payout = sol_received - platform_fee - creator_fee;

        // Burn seller's tokens
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;

        // Transfer SOL to seller (after fees)
        let transfer_seller = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.escrow.key(),
            &ctx.accounts.seller.key(),
            total_payout,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_seller,
            &[
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.seller.to_account_info(),
            ],
            &[],
        )?;

        // Distribute fees (same as buy)
        // ... (similar to buy_tokens)

        // Update token data
        token_data.tokens_sold -= amount;

        Ok(())
    }
}

// Price calculation helpers (linear bonding curve for MVP)
fn calculate_buy_cost(tokens_sold: u64, amount: u64, is_live: bool) -> Result<(u64, u64, u64)> {
    // Linear curve: Price = BASE_PRICE + (SLOPE * tokens_sold)
    const BASE_PRICE: u64 = 10; // lamports (0.00000001 SOL)
    const SLOPE: u64 = 1; // lamports per token sold

    // Calculate average price for this purchase
    let start_price = BASE_PRICE + (SLOPE * tokens_sold);
    let end_price = BASE_PRICE + (SLOPE * (tokens_sold + amount));
    let avg_price = (start_price + end_price) / 2;

    let sol_cost = (avg_price * amount) / 1_000_000_000; // Convert to lamports

    // Fees
    let platform_fee = sol_cost / 100; // 1%
    let creator_fee = if is_live {
        sol_cost * 2 / 100 // 2%
    } else {
        sol_cost / 500 // 0.2%
    };

    Ok((sol_cost, platform_fee, creator_fee))
}

fn calculate_sell_proceeds(tokens_sold: u64, amount: u64, is_live: bool) -> Result<(u64, u64, u64)> {
    // Same logic but selling reduces tokens_sold
    let (sol_received, platform_fee, creator_fee) =
        calculate_buy_cost(tokens_sold - amount, amount, is_live)?;

    Ok((sol_received, platform_fee, creator_fee))
}

// Account structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + Platform::LEN
    )]
    pub platform: Account<'info, Platform>,
    /// CHECK: Platform fee wallet
    pub platform_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + TokenData::LEN
    )]
    pub token_data: Account<'info, TokenData>,
    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    /// CHECK: Mint authority PDA
    pub mint_authority: AccountInfo<'info>,
    #[account(
        init,
        payer = creator,
        token::mint = mint,
        token::authority = creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    /// CHECK: Escrow account
    #[account(mut)]
    pub escrow: AccountInfo<'info>,
    /// CHECK: Platform wallet
    #[account(mut)]
    pub platform_wallet: AccountInfo<'info>,
    /// CHECK: Creator wallet
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    /// CHECK: Mint authority PDA
    pub mint_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// State structures
#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub platform_wallet: Pubkey,
    pub total_fees_collected: u64,
}

impl Platform {
    pub const LEN: usize = 32 + 32 + 8;
}

#[account]
pub struct TokenData {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub tokens_sold: u64,
    pub total_supply: u64,
    pub curve_supply: u64,
    pub creator_supply: u64,
    pub is_live: bool,
}

impl TokenData {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 1;
}
```

---

## API Routes

### POST /api/tokens/create

```typescript
// app/api/tokens/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest) {
  try {
    const {
      walletAddress,
      tokenAddress,
      name,
      ticker,
      thumbnailUrl,
      streamerUsername,
      platform = 'twitch'
    } = await req.json();

    // Validate inputs
    if (!walletAddress || !tokenAddress || !name || !ticker || !streamerUsername) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Solana addresses
    try {
      new PublicKey(walletAddress);
      new PublicKey(tokenAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid Solana address' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if wallet already has a token
    const { data: existing } = await supabase
      .from('tokens')
      .select('id')
      .eq('creator_wallet', walletAddress)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already has a token' },
        { status: 409 }
      );
    }

    // Insert token
    const { data, error } = await supabase
      .from('tokens')
      .insert({
        address: tokenAddress,
        creator_wallet: walletAddress,
        name,
        ticker,
        thumbnail_url: thumbnailUrl,
        platform,
        streamer_username: streamerUsername,
        current_price: 0.00000001, // Starting price
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### GET /api/twitch/stream-status

```typescript
// app/api/twitch/stream-status/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;

let accessToken: string | null = null;

async function getTwitchAccessToken() {
  if (accessToken) return accessToken;

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  const data = await response.json();
  accessToken = data.access_token;
  return accessToken;
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username required' },
      { status: 400 }
    );
  }

  try {
    const token = await getTwitchAccessToken();

    // Get user ID
    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const userData = await userResponse.json();
    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userData.data[0].id;

    // Check stream status
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${userId}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const streamData = await streamResponse.json();
    const isLive = streamData.data && streamData.data.length > 0;

    return NextResponse.json({
      username,
      isLive,
      viewerCount: isLive ? streamData.data[0].viewer_count : 0,
    });
  } catch (error) {
    console.error('Twitch API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream status' },
      { status: 500 }
    );
  }
}
```

---

## Frontend Components

### Wallet Button

```typescript
// components/wallet/WalletButton.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="btn btn-primary" />
      {connected && publicKey && (
        <div className="text-sm text-gray-600">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </div>
      )}
    </div>
  );
}
```

### Buy Panel

```typescript
// components/trading/BuyPanel.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { calculateBuyCost } from '@/lib/bonding-curve';

interface BuyPanelProps {
  tokenAddress: string;
  tokensSold: number;
  isLive: boolean;
}

export function BuyPanel({ tokenAddress, tokensSold, isLive }: BuyPanelProps) {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!publicKey || !amount) return;

    setLoading(true);
    try {
      const numAmount = parseInt(amount);

      // Calculate cost
      const { total, platformFee, creatorFee } = calculateBuyCost(
        tokensSold,
        numAmount,
        isLive
      );

      // Build transaction
      // ... (Solana transaction logic)

      // Sign and send
      // ... (await signTransaction)

      alert('Purchase successful!');
      setAmount('');
    } catch (error) {
      console.error('Buy error:', error);
      alert('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const cost = amount ? calculateBuyCost(tokensSold, parseInt(amount), isLive) : null;

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Buy Tokens</h2>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Amount</span>
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="input input-bordered"
        />
      </div>

      {cost && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Cost:</span>
            <span>{cost.solCost.toFixed(6)} SOL</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (1%):</span>
            <span>{cost.platformFee.toFixed(6)} SOL</span>
          </div>
          <div className="flex justify-between">
            <span>Creator Fee ({isLive ? '2%' : '0.2%'}):</span>
            <span>{cost.creatorFee.toFixed(6)} SOL</span>
          </div>
          <div className="divider"></div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{cost.total.toFixed(6)} SOL</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={!publicKey || !amount || loading}
        className="btn btn-primary mt-4"
      >
        {loading ? 'Processing...' : 'Buy Tokens'}
      </button>

      {isLive && (
        <div className="alert alert-success mt-4">
          <span>Streamer is LIVE! Supporting with 2% creator fees</span>
        </div>
      )}
    </div>
  );
}
```

---

## Bonding Curve Math

### Linear Bonding Curve (MVP)

```typescript
// lib/bonding-curve.ts

// Constants
export const BONDING_CURVE_CONFIG = {
  basePrice: 0.00000001, // SOL per token (starting price)
  slope: 0.0000000001, // Price increase per token sold
  totalSupply: 1_000_000_000,
  curveSupply: 800_000_000,
  creatorSupply: 200_000_000,

  platformFeeBps: 100, // 1%
  creatorFeeLiveBps: 200, // 2%
  creatorFeeOfflineBps: 20, // 0.2%
} as const;

/**
 * Calculate price at a specific point on the curve
 * Linear formula: Price = BASE_PRICE + (SLOPE × tokens_sold)
 */
export function calculatePrice(tokensSold: number): number {
  return BONDING_CURVE_CONFIG.basePrice +
         (BONDING_CURVE_CONFIG.slope * tokensSold);
}

/**
 * Calculate cost to buy tokens (including fees)
 */
export function calculateBuyCost(
  currentTokensSold: number,
  tokensToBuy: number,
  isLive: boolean
): {
  solCost: number;
  platformFee: number;
  creatorFee: number;
  total: number;
} {
  // Calculate average price for this purchase
  // Using trapezoidal rule for area under linear curve
  const startPrice = calculatePrice(currentTokensSold);
  const endPrice = calculatePrice(currentTokensSold + tokensToBuy);
  const avgPrice = (startPrice + endPrice) / 2;

  const solCost = avgPrice * tokensToBuy;

  // Calculate fees
  const platformFee = solCost * (BONDING_CURVE_CONFIG.platformFeeBps / 10000);
  const creatorFeeBps = isLive
    ? BONDING_CURVE_CONFIG.creatorFeeLiveBps
    : BONDING_CURVE_CONFIG.creatorFeeOfflineBps;
  const creatorFee = solCost * (creatorFeeBps / 10000);

  const total = solCost + platformFee + creatorFee;

  return { solCost, platformFee, creatorFee, total };
}

/**
 * Calculate proceeds from selling tokens (after fees)
 */
export function calculateSellProceeds(
  currentTokensSold: number,
  tokensToSell: number,
  isLive: boolean
): {
  solReceived: number;
  platformFee: number;
  creatorFee: number;
  total: number;
} {
  // Selling moves backwards on the curve
  const startPrice = calculatePrice(currentTokensSold - tokensToSell);
  const endPrice = calculatePrice(currentTokensSold);
  const avgPrice = (startPrice + endPrice) / 2;

  const solReceived = avgPrice * tokensToSell;

  // Fees deducted from proceeds
  const platformFee = solReceived * (BONDING_CURVE_CONFIG.platformFeeBps / 10000);
  const creatorFeeBps = isLive
    ? BONDING_CURVE_CONFIG.creatorFeeLiveBps
    : BONDING_CURVE_CONFIG.creatorFeeOfflineBps;
  const creatorFee = solReceived * (creatorFeeBps / 10000);

  const total = solReceived - platformFee - creatorFee;

  return { solReceived, platformFee, creatorFee, total };
}

/**
 * Calculate market cap
 */
export function calculateMarketCap(tokensSold: number): number {
  const currentPrice = calculatePrice(tokensSold);
  return currentPrice * BONDING_CURVE_CONFIG.totalSupply;
}

/**
 * Generate price history data points for chart
 */
export function generatePriceHistory(maxTokensSold: number, points: number = 100) {
  const step = maxTokensSold / points;
  const history = [];

  for (let i = 0; i <= points; i++) {
    const tokensSold = i * step;
    const price = calculatePrice(tokensSold);
    history.push({ tokensSold, price });
  }

  return history;
}
```

---

## Real-time Updates

### Supabase Realtime Hook

```typescript
// hooks/useRealtime.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function useTokenRealtime(tokenAddress: string) {
  const [tokenData, setTokenData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to token changes
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
          console.log('Token updated:', payload);
          setTokenData(payload.new);
        }
      )
      .subscribe();

    // Initial fetch
    supabase
      .from('tokens')
      .select('*')
      .eq('address', tokenAddress)
      .single()
      .then(({ data }) => setTokenData(data));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tokenAddress]);

  return tokenData;
}

export function useTradesRealtime(tokenAddress: string) {
  const [trades, setTrades] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`trades:${tokenAddress}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
          filter: `token_address=eq.${tokenAddress}`,
        },
        (payload) => {
          console.log('New trade:', payload);
          setTrades((prev) => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    // Initial fetch
    supabase
      .from('trades')
      .select('*')
      .eq('token_address', tokenAddress)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setTrades(data || []));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tokenAddress]);

  return trades;
}
```

---

## Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured (.env.local)
  - [ ] NEXT_PUBLIC_SOLANA_RPC_URL
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] TWITCH_CLIENT_ID
  - [ ] TWITCH_CLIENT_SECRET
  - [ ] PLATFORM_WALLET_ADDRESS

- [ ] Smart contract deployed to Devnet
  - [ ] Program ID updated in code
  - [ ] Platform initialized
  - [ ] Test transactions successful

- [ ] Database setup
  - [ ] Tables created
  - [ ] RLS policies enabled
  - [ ] Realtime enabled on tables
  - [ ] Indexes created

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc
```

### Post-deployment Verification

- [ ] Homepage loads without errors
- [ ] Wallet connection works
- [ ] Token creation works
- [ ] Trading (buy/sell) works
- [ ] Real-time updates work
- [ ] Twitch API integration works
- [ ] Mobile responsive
- [ ] No console errors

### Monitoring

```typescript
// Add error boundary
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
```

---

## Environment Variables Template

```bash
# .env.local

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YourProgramIDHere

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Twitch
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret

# Platform
PLATFORM_WALLET_ADDRESS=your_wallet_address_here
```

---

## Quick Start Commands

```bash
# Initialize project
npx create-next-app@latest zeroglaze --typescript --tailwind --app
cd zeroglaze

# Install dependencies
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/spl-token
npm install @supabase/supabase-js
npm install chart.js react-chartjs-2
npm install daisyui

# Initialize Anchor project
anchor init zeroglaze-contracts
cd zeroglaze-contracts

# Build smart contract
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run Next.js dev server
npm run dev
```

---

**Last Updated**: December 26, 2024
**Status**: Ready for implementation
