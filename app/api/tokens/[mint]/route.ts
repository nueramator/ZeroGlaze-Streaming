import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, TokenDetailsResponse } from '@/lib/types/api';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/tokens/[mint]
 * Get detailed information about a specific token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { mint: string } }
): Promise<NextResponse<ApiResponse<TokenDetailsResponse>>> {
  try {
    const { mint } = params;

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token_mint', mint)
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

    // Get recent trades for this token
    const { data: recentTrades } = await supabase
      .from('trades')
      .select('*')
      .eq('token_mint', mint)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate progress
    const progress = Math.round((token.tokens_sold / 800_000_000) * 100);

    const details: TokenDetailsResponse = {
      tokenMint: token.token_mint,
      tokenName: token.token_name,
      tokenSymbol: token.token_symbol,
      tokenUri: token.token_uri,
      creator: token.creator_wallet,
      creatorTwitter: token.creator_twitter,
      creatorTwitch: token.creator_twitch,
      freezeCreatorAllocation: token.freeze_creator_allocation,
      currentPrice: token.current_price,
      marketCap: token.market_cap,
      tokensSold: token.tokens_sold,
      totalSupply: 1_000_000_000,
      progress,
      isLive: token.is_live,
      graduated: token.graduated,
      totalVolume: token.total_volume,
      createdAt: token.created_at,
    };

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Get token details error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch token details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
