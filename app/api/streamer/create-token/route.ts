import { NextRequest, NextResponse } from 'next/server';
import { createTokenRequestSchema, ApiResponse, CreateTokenResponse } from '@/lib/types/api';
import { createToken } from '@/lib/solana/program';
import { supabaseAdmin } from '@/lib/supabase/client';
import { PublicKey } from '@solana/web3.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/streamer/create-token
 * Create a new token with bonding curve
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<CreateTokenResponse>>> {
  try {
    const body = await request.json();

    // Validate request
    const validation = createTokenRequestSchema.safeParse(body);
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

    const {
      tokenName,
      tokenSymbol,
      tokenUri,
      creatorWallet,
      creatorTwitter,
      creatorTwitch,
      freezeCreatorAllocation,
    } = validation.data;

    // Validate wallet address
    try {
      new PublicKey(creatorWallet);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid creator wallet address',
        },
        { status: 400 }
      );
    }

    // Check if creator already has an active token
    const { data: existingTokens, error: checkError } = await supabaseAdmin
      .from('tokens')
      .select('id')
      .eq('creator_wallet', creatorWallet)
      .eq('graduated', false)
      .limit(1);

    if (checkError) {
      throw new Error(`Database error: ${checkError.message}`);
    }

    if (existingTokens && existingTokens.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creator already has an active token. Graduate existing token first.',
        },
        { status: 409 }
      );
    }

    // Create token on Solana
    const tokenCreation = await createToken({
      tokenName,
      tokenSymbol,
      tokenUri,
      creatorWallet,
      creatorTwitter,
      creatorTwitch,
      freezeCreatorAllocation,
    });

    // Store in database
    const { data: token, error: dbError } = await supabaseAdmin
      .from('tokens')
      .insert({
        token_mint: tokenCreation.tokenMint,
        bonding_curve_address: tokenCreation.bondingCurve,
        creator_wallet: creatorWallet,
        token_name: tokenName,
        token_symbol: tokenSymbol,
        token_uri: tokenUri,
        creator_twitter: creatorTwitter,
        creator_twitch: creatorTwitch,
        freeze_creator_allocation: freezeCreatorAllocation,
        current_price: 0.00000002796, // Initial price from math.md
        market_cap: 0,
        tokens_sold: 0,
        is_live: false,
        graduated: false,
        total_volume: 0,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Failed to store token: ${dbError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          tokenMint: tokenCreation.tokenMint,
          bondingCurve: tokenCreation.bondingCurve,
          transactionSignature: tokenCreation.transactionSignature,
          tokenId: token.id,
        },
        message: 'Token created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create token error:', error);
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
