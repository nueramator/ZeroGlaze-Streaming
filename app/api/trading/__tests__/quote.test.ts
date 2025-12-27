/**
 * Trading Quote API Tests
 * Tests for GET /api/trading/quote endpoint
 */

import { POST } from '../quote/route';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import {
  mockTokenData,
  TEST_TOKEN_MINT,
  validateApiResponse,
  createMockSupabaseClient,
} from '@/__tests__/utils/test-helpers';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('POST /api/trading/quote', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should reject request with missing tokenMint', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
    });

    it('should reject request with missing tokenAmount', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject request with missing isBuy flag', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject negative token amount', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: -1000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject zero token amount', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 0,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid isBuy type', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: 'yes',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Token Validation', () => {
    it('should return 404 for non-existent token', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Token not found' },
      });

      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Token not found');
    });

    it('should reject graduated tokens', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { ...mockTokenData, graduated: true },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Token has graduated to DEX');
    });
  });

  describe('Buy Quote Calculations', () => {
    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: mockTokenData,
        error: null,
      });
    });

    it('should return valid buy quote for small amount', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 100000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('tokenAmount', 100000);
      expect(data.data).toHaveProperty('solAmount');
      expect(data.data).toHaveProperty('platformFee');
      expect(data.data).toHaveProperty('creatorFee');
      expect(data.data).toHaveProperty('totalCost');
      expect(data.data).toHaveProperty('pricePerToken');
      expect(data.data).toHaveProperty('priceImpact');
      expect(data.data).toHaveProperty('currentPrice');
      expect(data.data).toHaveProperty('newPrice');
    });

    it('should calculate correct fees when creator is live', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { ...mockTokenData, is_live: true },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Platform fee should be ~1% of solAmount
      const expectedPlatformFee = data.data.solAmount * 0.01;
      expect(data.data.platformFee).toBeCloseTo(expectedPlatformFee, 6);

      // Creator fee should be ~2% of solAmount when live
      const expectedCreatorFee = data.data.solAmount * 0.02;
      expect(data.data.creatorFee).toBeCloseTo(expectedCreatorFee, 6);

      // Total cost = solAmount + fees
      const expectedTotal = data.data.solAmount + data.data.platformFee + data.data.creatorFee;
      expect(data.data.totalCost).toBeCloseTo(expectedTotal, 6);
    });

    it('should calculate correct fees when creator is offline', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { ...mockTokenData, is_live: false },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Creator fee should be ~0.2% of solAmount when offline
      const expectedCreatorFee = data.data.solAmount * 0.002;
      expect(data.data.creatorFee).toBeCloseTo(expectedCreatorFee, 6);
    });

    it('should show positive price impact for buy', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.priceImpact).toBeGreaterThan(0);
      expect(data.data.newPrice).toBeGreaterThan(data.data.currentPrice);
    });

    it('should have higher price impact for larger buys', async () => {
      const smallBuyRequest = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 100000,
          isBuy: true,
        }),
      });

      const largeBuyRequest = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 10000000,
          isBuy: true,
        }),
      });

      const smallResponse = await POST(smallBuyRequest);
      const smallData = await smallResponse.json();

      const largeResponse = await POST(largeBuyRequest);
      const largeData = await largeResponse.json();

      expect(largeData.data.priceImpact).toBeGreaterThan(smallData.data.priceImpact);
    });
  });

  describe('Sell Quote Calculations', () => {
    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: mockTokenData,
        error: null,
      });
    });

    it('should return valid sell quote', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 100000,
          isBuy: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('tokenAmount', 100000);
      expect(data.data.solAmount).toBeGreaterThan(0);
    });

    it('should show negative price impact for sell', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.priceImpact).toBeLessThan(0);
      expect(data.data.newPrice).toBeLessThan(data.data.currentPrice);
    });

    it('should calculate correct fees for sell when live', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { ...mockTokenData, is_live: true },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // For sell, solAmount is the net output after fees
      // So we need to calculate from totalCost which is the gross output
      const grossOutput = data.data.totalCost;
      const expectedPlatformFee = grossOutput * 0.01;
      const expectedCreatorFee = grossOutput * 0.02;

      expect(data.data.platformFee).toBeCloseTo(expectedPlatformFee, 6);
      expect(data.data.creatorFee).toBeCloseTo(expectedCreatorFee, 6);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to calculate quote');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
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
      mockSupabase.single.mockResolvedValue({
        data: mockTokenData,
        error: null,
      });
    });

    it('should return properly structured success response', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      validateApiResponse(data);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should include all required quote fields', async () => {
      const request = new NextRequest('http://localhost/api/trading/quote', {
        method: 'POST',
        body: JSON.stringify({
          tokenMint: TEST_TOKEN_MINT,
          tokenAmount: 1000000,
          isBuy: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      const requiredFields = [
        'tokenAmount',
        'solAmount',
        'platformFee',
        'creatorFee',
        'totalCost',
        'pricePerToken',
        'priceImpact',
        'currentPrice',
        'newPrice',
      ];

      requiredFields.forEach(field => {
        expect(data.data).toHaveProperty(field);
        expect(typeof data.data[field]).toBe('number');
      });
    });
  });
});
