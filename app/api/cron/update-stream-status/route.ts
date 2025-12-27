import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Update Stream Status
 *
 * This endpoint is called periodically (every 5 minutes) by Vercel Cron
 * to update the stream status for all active streamers.
 *
 * It checks the Twitch API for each streamer and updates their status in the database.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Initialize Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get all streamers with Twitch integration enabled
    const { data: streamers, error: fetchError } = await supabase
      .from('streamers')
      .select('id, wallet_address, platform_user_id, platform')
      .eq('platform', 'twitch')
      .not('platform_user_id', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!streamers || streamers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No streamers to update',
        updated: 0,
      });
    }

    // Get Twitch access token
    const twitchToken = await getTwitchAccessToken();

    let updatedCount = 0;
    const errors: string[] = [];

    // Update status for each streamer
    for (const streamer of streamers) {
      try {
        const isLive = await checkTwitchStreamStatus(
          streamer.platform_user_id,
          twitchToken
        );

        // Update stream status in database
        const { error: updateError } = await supabase
          .from('stream_status')
          .upsert({
            streamer_id: streamer.id,
            is_live: isLive,
            last_checked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'streamer_id',
          });

        if (updateError) {
          errors.push(`Failed to update ${streamer.wallet_address}: ${updateError.message}`);
        } else {
          updatedCount++;
        }
      } catch (error: any) {
        errors.push(`Error checking ${streamer.wallet_address}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Stream status update completed',
      updated: updatedCount,
      total: streamers.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * Get Twitch OAuth access token
 */
async function getTwitchAccessToken(): Promise<string> {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    throw new Error('Twitch credentials not configured');
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Twitch access token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Check if a Twitch user is currently streaming
 */
async function checkTwitchStreamStatus(
  userId: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${userId}`,
    {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Twitch stream status');
  }

  const data = await response.json();
  return data.data && data.data.length > 0;
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
