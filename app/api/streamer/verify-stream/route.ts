import { NextRequest, NextResponse } from 'next/server';
import { verifyStreamRequestSchema, ApiResponse, StreamStatusResponse } from '@/lib/types/api';
import { supabase } from '@/lib/supabase/client';
import { checkTwitchStreamStatus } from '@/lib/integrations/twitch';
import { updateStreamStatus } from '@/lib/solana/program';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/streamer/verify-stream
 * Verify stream status and update on-chain state
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<StreamStatusResponse>>> {
  try {
    const body = await request.json();

    // Validate request
    const validation = verifyStreamRequestSchema.safeParse(body);
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

    const { tokenMint, platform } = validation.data;

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

    // Check stream status based on platform
    let streamStatus;
    if (platform === 'twitch') {
      const twitchUsername = token.creator_twitch;
      if (!twitchUsername) {
        return NextResponse.json(
          {
            success: false,
            error: 'Twitch username not configured for this token',
          },
          { status: 400 }
        );
      }
      streamStatus = await checkTwitchStreamStatus(twitchUsername);
    } else {
      // YouTube implementation would go here
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube integration not yet implemented',
        },
        { status: 501 }
      );
    }

    // Update on-chain stream status if changed
    if (streamStatus.isLive !== token.is_live) {
      await updateStreamStatus({
        bondingCurve: token.bonding_curve_address,
        isLive: streamStatus.isLive,
      });

      // Update database
      await supabase
        .from('tokens')
        .update({
          is_live: streamStatus.isLive,
          last_stream_check: new Date().toISOString(),
        })
        .eq('token_mint', tokenMint);
    }

    return NextResponse.json({
      success: true,
      data: {
        isLive: streamStatus.isLive,
        platform,
        viewerCount: streamStatus.viewerCount,
        streamTitle: streamStatus.streamTitle,
        lastChecked: new Date().toISOString(),
      },
      message: `Stream is ${streamStatus.isLive ? 'live' : 'offline'}`,
    });
  } catch (error) {
    console.error('Verify stream error:', error);
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
