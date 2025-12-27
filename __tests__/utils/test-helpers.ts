/**
 * Test Utilities and Helpers
 * Shared mocks, fixtures, and helper functions for tests
 */

import { PublicKey } from '@solana/web3.js';

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    limit: jest.fn().mockReturnThis(),
    rpc: jest.fn(),
  };

  return mockClient;
};

// Test fixtures
export const TEST_WALLETS = {
  creator: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
  trader: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
  platform: 'J1NguTqTpKk6rj5FFHbAzXQmyU9bPCf2QVnFkx5VQKVJ',
};

export const TEST_TOKEN_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const TEST_BONDING_CURVE = 'BondCurv1111111111111111111111111111111111111';

// Mock token data
export const mockTokenData = {
  id: 'test-uuid-123',
  token_mint: TEST_TOKEN_MINT,
  bonding_curve_address: TEST_BONDING_CURVE,
  creator_wallet: TEST_WALLETS.creator,
  token_name: 'Test Token',
  token_symbol: 'TEST',
  token_uri: 'https://example.com/metadata.json',
  creator_twitter: 'testcreator',
  creator_twitch: 'teststreamer',
  freeze_creator_allocation: true,
  current_price: 0.00000002796,
  market_cap: 27960,
  tokens_sold: 0,
  is_live: false,
  graduated: false,
  total_volume: 0,
  volume_24h: 0,
  volume_7d: 0,
  price_change_24h: 0,
  price_change_7d: 0,
  creator_fees_collected: 0,
  last_stream_check: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockTradeData = {
  id: 'trade-uuid-456',
  token_mint: TEST_TOKEN_MINT,
  trader_wallet: TEST_WALLETS.trader,
  trade_type: 'buy' as const,
  token_amount: 1000000,
  sol_amount: 0.03,
  platform_fee: 0.0003,
  creator_fee: 0.0006,
  total_cost: 0.0309,
  price_per_token: 0.000000031,
  transaction_signature: '5J7Wx...',
  created_at: new Date().toISOString(),
};

// Mock Solana transaction result
export const mockTransactionResult = {
  transactionSignature: '5J7Wx9KnvqCdXqJ8WN8qZP7z2mK8cR9X2eQdYvN8Tg2J',
  solAmount: 0.03,
  platformFee: 0.0003,
  creatorFee: 0.0006,
  totalCost: 0.0309,
  pricePerToken: 0.000000031,
  newPrice: 0.000000032,
};

// Helper to validate PublicKey
export const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Helper to create mock request body
export const createMockRequestBody = (body: any) => ({
  json: async () => body,
});

// Helper to validate API response structure
export const validateApiResponse = (response: any) => {
  expect(response).toHaveProperty('success');
  if (response.success) {
    expect(response).toHaveProperty('data');
  } else {
    expect(response).toHaveProperty('error');
  }
};

// Helper to calculate expected fees
export const calculateExpectedFees = (
  amount: number,
  isLive: boolean
) => {
  const platformFeeBps = 100; // 1%
  const creatorFeeBps = isLive ? 200 : 20; // 2% or 0.2%

  return {
    platformFee: Math.floor(amount * (platformFeeBps / 10000)),
    creatorFee: Math.floor(amount * (creatorFeeBps / 10000)),
  };
};

// Mock environment setup
export const setupTestEnvironment = () => {
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://api.devnet.solana.com';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
};

// Cleanup helper
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
