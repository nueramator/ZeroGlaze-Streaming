import { NextRequest, NextResponse } from 'next/server';
import { buyTokensRequestSchema, ApiResponse, TradeExecutionResponse } from '@/lib/types/api';
import { buyTokens } from '@/lib/solana/program';
import { supabase } from '@/lib/supabase/client';
import { PublicKey } from '@solana/web3.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/trading/buy
 * Execute a buy transaction on the bonding curve
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TradeExecutionResponse>>> {
  try {
    const body = await request.json();

    // Validate request
    const validation = buyTokensRequestSchema.safeParse(body);
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

    const { tokenMint, tokenAmount, maxSolCost, buyerWallet } = validation.data;

    // Validate wallet address
    try {
      new PublicKey(buyerWallet);
      new PublicKey(tokenMint);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid wallet or token address',
        },
        { status: 400 }
      );
    }

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
          error: 'Token has graduated to DEX. Trade on Raydium/Orca instead.',
        },
        { status: 400 }
      );
    }

    // Execute buy on Solana
    const result = await buyTokens({
      bondingCurve: token.bonding_curve_address,
      tokenMint,
      tokenAmount,
      maxSolCost,
      buyerWallet,
    });

    // Record trade in database
    const { error: tradeError } = await supabase.from('trades').insert({
      token_mint: tokenMint,
      trader_wallet: buyerWallet,
      trade_type: 'buy',
      token_amount: tokenAmount,
      sol_amount: result.solAmount,
      platform_fee: result.platformFee,
      creator_fee: result.creatorFee,
      total_cost: result.totalCost,
      price_per_token: result.pricePerToken,
      transaction_signature: result.transactionSignature,
    });

    if (tradeError) {
      console.error('Failed to record trade:', tradeError);
      // Don't fail the request, trade was successful
    }

    // Update token stats
    await supabase.rpc('update_token_after_buy', {
      p_token_mint: tokenMint,
      p_tokens_sold: tokenAmount,
      p_sol_amount: result.solAmount,
      p_new_price: result.newPrice,
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionSignature: result.transactionSignature,
        tokenAmount,
        solAmount: result.solAmount,
        totalFees: result.platformFee + result.creatorFee,
        newPrice: result.newPrice,
      },
      message: `Successfully bought ${tokenAmount} tokens`,
    });
  } catch (error) {
    console.error('Buy tokens error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Trade execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
