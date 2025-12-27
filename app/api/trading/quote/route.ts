import { NextRequest, NextResponse } from 'next/server';
import { getQuoteRequestSchema, ApiResponse, TradeQuote } from '@/lib/types/api';
import { supabase } from '@/lib/supabase/client';
import { calculateBuyCost, calculateSellOutput } from '@/lib/utils/bonding-curve';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/trading/quote
 * Get a quote for buying or selling tokens
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TradeQuote>>> {
  try {
    const body = await request.json();

    // Validate request
    const validation = getQuoteRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          message: validation.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { tokenMint, tokenAmount, isBuy } = validation.data;

    // Get token from database
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token_mint', tokenMint)
      .single();

    if (tokenError || !token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token not found',
        },
        { status: 404 }
      );
    }

    if (token.graduated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token has graduated to DEX',
        },
        { status: 400 }
      );
    }

    // Get current bonding curve state (in production, query from chain)
    const virtualSolReserves = 30 * 1e9; // 30 SOL in lamports
    const virtualTokenReserves = 1_073_000_000 - token.tokens_sold;
    const currentPrice = virtualSolReserves / virtualTokenReserves;

    let quote: TradeQuote;

    if (isBuy) {
      const result = calculateBuyCost(
        virtualSolReserves,
        virtualTokenReserves,
        tokenAmount,
        token.is_live
      );

      const newTokenReserves = virtualTokenReserves - tokenAmount;
      const newPrice = virtualSolReserves / newTokenReserves;
      const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;

      quote = {
        tokenAmount,
        solAmount: result.solRequired / 1e9,
        platformFee: result.platformFee / 1e9,
        creatorFee: result.creatorFee / 1e9,
        totalCost: result.totalCost / 1e9,
        pricePerToken: result.totalCost / tokenAmount / 1e9,
        priceImpact,
        currentPrice: currentPrice / 1e9,
        newPrice: newPrice / 1e9,
      };
    } else {
      const result = calculateSellOutput(
        virtualSolReserves,
        virtualTokenReserves,
        tokenAmount,
        token.is_live
      );

      const newTokenReserves = virtualTokenReserves + tokenAmount;
      const newPrice = virtualSolReserves / newTokenReserves;
      const priceImpact = ((currentPrice - newPrice) / currentPrice) * 100;

      quote = {
        tokenAmount,
        solAmount: result.netOutput / 1e9,
        platformFee: result.platformFee / 1e9,
        creatorFee: result.creatorFee / 1e9,
        totalCost: result.solToReturn / 1e9,
        pricePerToken: result.solToReturn / tokenAmount / 1e9,
        priceImpact: -priceImpact, // Negative for sells
        currentPrice: currentPrice / 1e9,
        newPrice: newPrice / 1e9,
      };
    }

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
