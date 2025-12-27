import { NextRequest, NextResponse } from 'next/server';
import { streamStatusWebhookSchema, ApiResponse } from '@/lib/types/api';
import { supabase } from '@/lib/supabase/client';
import { updateStreamStatus } from '@/lib/solana/program';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhook/stream-status
 * Webhook endpoint for stream status updates (from Twitch/YouTube)
 * Should be secured with webhook secret validation
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Verify webhook signature (implement based on platform)
    const headersList = headers();
    const signature = headersList.get('x-webhook-signature');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret || signature !== webhookSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook signature',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = streamStatusWebhookSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook data',
          message: validation.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { tokenMint, platform, isLive, viewerCount, streamTitle } = validation.data;

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

    // Only update if status changed
    if (token.is_live !== isLive) {
      // Update on-chain state
      await updateStreamStatus({
        bondingCurve: token.bonding_curve_address,
        isLive,
      });

      // Update database
      await supabase
        .from('tokens')
        .update({
          is_live: isLive,
          last_stream_check: new Date().toISOString(),
        })
        .eq('token_mint', tokenMint);

      // Log stream status change
      await supabase.from('stream_events').insert({
        token_mint: tokenMint,
        platform,
        event_type: isLive ? 'stream_started' : 'stream_ended',
        viewer_count: viewerCount,
        stream_title: streamTitle,
      });

      console.log(`Stream status updated for ${tokenMint}: ${isLive ? 'LIVE' : 'OFFLINE'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Stream status updated',
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
