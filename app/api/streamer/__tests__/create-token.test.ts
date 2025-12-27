/**
 * Create Token API Tests
 * Tests for POST /api/streamer/create-token endpoint
 */

import { POST } from '../create-token/route';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createToken } from '@/lib/solana/program';
import {
  TEST_WALLETS,
  TEST_TOKEN_MINT,
  TEST_BONDING_CURVE,
  mockTokenData,
  validateApiResponse,
  createMockSupabaseClient,
} from '@/__tests__/utils/test-helpers';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/solana/program', () => ({
  createToken: jest.fn(),
}));

describe('POST /api/streamer/create-token', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabase);

    // Mock successful token creation by default
    (createToken as jest.Mock).mockResolvedValue({
      tokenMint: TEST_TOKEN_MINT,
      bondingCurve: TEST_BONDING_CURVE,
      transactionSignature: '5J7Wx9KnvqCdXqJ8WN8qZP7z2mK8cR9X2eQdYvN8Tg2J',
    });

    // Mock no existing tokens by default
    mockSupabase.single.mockResolvedValue({ data: null, error: null });
    mockSupabase.limit.mockReturnThis();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should reject request with missing tokenName', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
    });

    it('should reject request with missing tokenSymbol', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject tokenName longer than 32 characters', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'A'.repeat(33),
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject tokenSymbol longer than 10 characters', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TOOLONGSYM',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject empty tokenName', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: '',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid tokenUri (not a URL)', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'not-a-valid-url',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject missing creatorWallet', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid Solana wallet address', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: 'invalid-wallet-address',
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid creator wallet address');
    });

    it('should reject missing freezeCreatorAllocation', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Business Logic Validation', () => {
    it('should prevent creator from having multiple active tokens', async () => {
      // Mock existing active token
      mockSupabase.limit.mockReturnValue({
        ...mockSupabase,
        single: jest.fn().mockResolvedValue({
          data: [{ id: 'existing-token' }],
          error: null,
        }),
      });

      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already has an active token');
    });

    it('should allow creator to create token after previous token graduated', async () => {
      // Mock check for existing tokens - none found
      mockSupabase.limit.mockReturnValue({
        ...mockSupabase,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      // Mock successful database insert
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'new-token-id' },
            error: null,
          }),
        }),
      });
      mockSupabase.insert = insertMock;

      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'New Token',
          tokenSymbol: 'NEW',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('Successful Token Creation', () => {
    beforeEach(() => {
      // Mock no existing tokens
      mockSupabase.limit.mockReturnValue({
        ...mockSupabase,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      // Mock successful database insert
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'new-token-id' },
            error: null,
          }),
        }),
      });
      mockSupabase.insert = insertMock;
    });

    it('should create token successfully with valid data', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Token created successfully');
    });

    it('should return all required fields in response', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('tokenMint');
      expect(data.data).toHaveProperty('bondingCurve');
      expect(data.data).toHaveProperty('transactionSignature');
      expect(data.data).toHaveProperty('tokenId');
    });

    it('should call createToken with correct parameters', async () => {
      const tokenData = {
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        tokenUri: 'https://example.com/metadata.json',
        creatorWallet: TEST_WALLETS.creator,
        creatorTwitter: 'testuser',
        creatorTwitch: 'teststreamer',
        freezeCreatorAllocation: true,
      };

      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify(tokenData),
      });

      await POST(request);

      expect(createToken).toHaveBeenCalledWith(tokenData);
    });

    it('should store token in database with correct initial values', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      await POST(request);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          token_mint: TEST_TOKEN_MINT,
          bonding_curve_address: TEST_BONDING_CURVE,
          creator_wallet: TEST_WALLETS.creator,
          token_name: 'Test Token',
          token_symbol: 'TEST',
          tokens_sold: 0,
          is_live: false,
          graduated: false,
          total_volume: 0,
        })
      );
    });

    it('should set correct initial price', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      await POST(request);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          current_price: 0.00000002796, // Initial price from bonding curve
        })
      );
    });

    it('should work with freezeCreatorAllocation set to false', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle Solana transaction failure', async () => {
      // Mock no existing tokens
      mockSupabase.limit.mockReturnValue({
        ...mockSupabase,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      (createToken as jest.Mock).mockRejectedValue(
        new Error('Insufficient funds for transaction')
      );

      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle database insert failure', async () => {
      // Mock no existing tokens
      mockSupabase.limit.mockReturnValue({
        ...mockSupabase,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      // Mock database insert failure
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database insert failed' },
          }),
        }),
      });
      mockSupabase.insert = insertMock;

      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: 'not valid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Response Structure', () => {
    beforeEach(() => {
      mockSupabase.limit.mockReturnValue({
        ...mockSupabase,
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'new-token-id' },
            error: null,
          }),
        }),
      });
      mockSupabase.insert = insertMock;
    });

    it('should return properly structured success response', async () => {
      const request = new NextRequest('http://localhost/api/streamer/create-token', {
        method: 'POST',
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenUri: 'https://example.com/metadata.json',
          creatorWallet: TEST_WALLETS.creator,
          creatorTwitter: 'testuser',
          creatorTwitch: 'teststreamer',
          freezeCreatorAllocation: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      validateApiResponse(data);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.message).toBeDefined();
    });
  });
});
