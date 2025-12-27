import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/api';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/streamer/profile?wallet=<address>
 * Get streamer profile and token stats
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet address is required',
        },
        { status: 400 }
      );
    }

    // Get all tokens created by this wallet
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('*')
      .eq('creator_wallet', wallet)
      .order('created_at', { ascending: false });

    if (tokensError) {
      throw new Error(`Database error: ${tokensError.message}`);
    }

    // Calculate total stats
    const totalVolume = tokens?.reduce((sum, token) => sum + (token.total_volume || 0), 0) || 0;
    const totalFees = tokens?.reduce((sum, token) => sum + (token.creator_fees_collected || 0), 0) || 0;
    const graduatedTokens = tokens?.filter(t => t.graduated).length || 0;

    // Get recent trades
    const { data: recentTrades, error: tradesError } = await supabase
      .from('trades')
      .select(`
        *,
        tokens (
          token_name,
          token_symbol,
          token_uri
        )
      `)
      .in('token_mint', tokens?.map(t => t.token_mint) || [])
      .order('created_at', { ascending: false })
      .limit(10);

    if (tradesError) {
      console.error('Trades query error:', tradesError);
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        tokensCreated: tokens?.length || 0,
        graduatedTokens,
        totalVolume,
        totalFeesEarned: totalFees,
        tokens: tokens || [],
        recentTrades: recentTrades || [],
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
