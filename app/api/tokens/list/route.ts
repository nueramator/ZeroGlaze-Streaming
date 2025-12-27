import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, TokenListItem } from '@/lib/types/api';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/tokens/list?sort=volume|created|price&filter=live|all&limit=50
 * Get list of tokens with filtering and sorting
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TokenListItem[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'created';
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('tokens')
      .select(`
        token_mint,
        token_name,
        token_symbol,
        token_uri,
        creator_wallet,
        current_price,
        market_cap,
        tokens_sold,
        is_live,
        graduated,
        total_volume,
        created_at,
        volume_24h,
        price_change_24h
      `);

    // Apply filters
    if (filter === 'live') {
      query = query.eq('is_live', true);
    } else if (filter === 'graduated') {
      query = query.eq('graduated', true);
    } else if (filter === 'active') {
      query = query.eq('graduated', false);
    }

    // Apply sorting
    if (sort === 'volume') {
      query = query.order('volume_24h', { ascending: false });
    } else if (sort === 'price') {
      query = query.order('price_change_24h', { ascending: false });
    } else if (sort === 'marketcap') {
      query = query.order('market_cap', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tokens, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Calculate progress for each token
    const tokenList: TokenListItem[] = (tokens || []).map(token => ({
      tokenMint: token.token_mint,
      tokenName: token.token_name,
      tokenSymbol: token.token_symbol,
      tokenUri: token.token_uri,
      creator: token.creator_wallet,
      currentPrice: token.current_price,
      marketCap: token.market_cap,
      progress: Math.round((token.tokens_sold / 800_000_000) * 100),
      isLive: token.is_live,
      graduated: token.graduated,
      volume24h: token.volume_24h || 0,
      priceChange24h: token.price_change_24h || 0,
      createdAt: token.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: tokenList,
    });
  } catch (error) {
    console.error('List tokens error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
