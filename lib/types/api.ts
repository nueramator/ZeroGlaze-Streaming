import { z } from 'zod';

// ============================================================================
// Request/Response Schemas
// ============================================================================

// Streamer API Schemas
export const createTokenRequestSchema = z.object({
  tokenName: z.string().min(1).max(32),
  tokenSymbol: z.string().min(1).max(10),
  tokenUri: z.string().url().max(200),
  creatorWallet: z.string(),
  creatorTwitter: z.string().max(32),
  creatorTwitch: z.string().max(32),
  freezeCreatorAllocation: z.boolean(),
});

export const verifyStreamRequestSchema = z.object({
  tokenMint: z.string(),
  platform: z.enum(['twitch', 'youtube']),
});

// Trading API Schemas
export const buyTokensRequestSchema = z.object({
  tokenMint: z.string(),
  tokenAmount: z.number().positive(),
  maxSolCost: z.number().positive(),
  buyerWallet: z.string(),
});

export const sellTokensRequestSchema = z.object({
  tokenMint: z.string(),
  tokenAmount: z.number().positive(),
  minSolOutput: z.number().positive(),
  sellerWallet: z.string(),
});

export const getQuoteRequestSchema = z.object({
  tokenMint: z.string(),
  tokenAmount: z.number().positive(),
  isBuy: z.boolean(),
});

// Webhook Schemas
export const streamStatusWebhookSchema = z.object({
  tokenMint: z.string(),
  platform: z.enum(['twitch', 'youtube']),
  isLive: z.boolean(),
  viewerCount: z.number().optional(),
  streamTitle: z.string().optional(),
});

// Types
export type CreateTokenRequest = z.infer<typeof createTokenRequestSchema>;
export type VerifyStreamRequest = z.infer<typeof verifyStreamRequestSchema>;
export type BuyTokensRequest = z.infer<typeof buyTokensRequestSchema>;
export type SellTokensRequest = z.infer<typeof sellTokensRequestSchema>;
export type GetQuoteRequest = z.infer<typeof getQuoteRequestSchema>;
export type StreamStatusWebhook = z.infer<typeof streamStatusWebhookSchema>;

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateTokenResponse {
  tokenMint: string;
  bondingCurve: string;
  transactionSignature: string;
  tokenId: string;
}

export interface StreamStatusResponse {
  isLive: boolean;
  platform: 'twitch' | 'youtube';
  viewerCount?: number;
  streamTitle?: string;
  lastChecked: string;
}

export interface TradeQuote {
  tokenAmount: number;
  solAmount: number;
  platformFee: number;
  creatorFee: number;
  totalCost: number;
  pricePerToken: number;
  priceImpact: number;
  currentPrice: number;
  newPrice: number;
}

export interface TradeExecutionResponse {
  transactionSignature: string;
  tokenAmount: number;
  solAmount: number;
  totalFees: number;
  newPrice: number;
}

export interface TokenDetailsResponse {
  tokenMint: string;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  creator: string;
  creatorTwitter: string;
  creatorTwitch: string;
  freezeCreatorAllocation: boolean;
  currentPrice: number;
  marketCap: number;
  tokensSold: number;
  totalSupply: number;
  progress: number;
  isLive: boolean;
  graduated: boolean;
  totalVolume: number;
  createdAt: string;
}

export interface TokenListItem {
  tokenMint: string;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  creator: string;
  currentPrice: number;
  marketCap: number;
  progress: number;
  isLive: boolean;
  graduated: boolean;
  volume24h: number;
  priceChange24h: number;
  createdAt: string;
}
