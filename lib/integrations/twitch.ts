/**
 * Twitch API Integration
 * Handles stream status verification and webhook management
 */

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStreamData {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchStreamResponse {
  data: TwitchStreamData[];
}

export interface StreamStatus {
  isLive: boolean;
  viewerCount?: number;
  streamTitle?: string;
  startedAt?: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get Twitch OAuth token
 */
async function getTwitchToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Twitch credentials not configured');
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Twitch token: ${response.statusText}`);
  }

  const data: TwitchTokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000; // Refresh 5 min before expiry

  return cachedToken;
}

/**
 * Check if a Twitch streamer is currently live
 */
export async function checkTwitchStreamStatus(username: string): Promise<StreamStatus> {
  try {
    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error('Twitch client ID not configured');
    }

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(username)}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.statusText}`);
    }

    const data: TwitchStreamResponse = await response.json();

    if (data.data.length === 0) {
      return { isLive: false };
    }

    const stream = data.data[0];
    return {
      isLive: stream.type === 'live',
      viewerCount: stream.viewer_count,
      streamTitle: stream.title,
      startedAt: stream.started_at,
    };
  } catch (error) {
    console.error(`Error checking Twitch stream for ${username}:`, error);
    throw error;
  }
}

/**
 * Verify Twitch username exists
 */
export async function verifyTwitchUsername(username: string): Promise<boolean> {
  try {
    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error('Twitch client ID not configured');
    }

    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch (error) {
    console.error(`Error verifying Twitch username ${username}:`, error);
    return false;
  }
}

/**
 * Setup EventSub subscription for stream online/offline events
 * This would be called during token creation to set up webhooks
 */
export async function setupTwitchWebhook(
  userId: string,
  callbackUrl: string
): Promise<void> {
  try {
    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error('Twitch client ID not configured');
    }

    // Subscribe to stream.online event
    const onlineResponse = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'stream.online',
        version: '1',
        condition: {
          broadcaster_user_id: userId,
        },
        transport: {
          method: 'webhook',
          callback: callbackUrl,
          secret: process.env.WEBHOOK_SECRET,
        },
      }),
    });

    if (!onlineResponse.ok) {
      const error = await onlineResponse.text();
      throw new Error(`Failed to create online webhook: ${error}`);
    }

    // Subscribe to stream.offline event
    const offlineResponse = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'stream.offline',
        version: '1',
        condition: {
          broadcaster_user_id: userId,
        },
        transport: {
          method: 'webhook',
          callback: callbackUrl,
          secret: process.env.WEBHOOK_SECRET,
        },
      }),
    });

    if (!offlineResponse.ok) {
      const error = await offlineResponse.text();
      throw new Error(`Failed to create offline webhook: ${error}`);
    }

    console.log(`Twitch webhooks setup for user ${userId}`);
  } catch (error) {
    console.error('Error setting up Twitch webhook:', error);
    throw error;
  }
}

/**
 * Batch check multiple streamers
 * Useful for periodic status updates
 */
export async function batchCheckStreams(usernames: string[]): Promise<Map<string, StreamStatus>> {
  try {
    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error('Twitch client ID not configured');
    }

    // Twitch API allows up to 100 usernames per request
    const chunks = [];
    for (let i = 0; i < usernames.length; i += 100) {
      chunks.push(usernames.slice(i, i + 100));
    }

    const results = new Map<string, StreamStatus>();

    for (const chunk of chunks) {
      const params = chunk.map(u => `user_login=${encodeURIComponent(u)}`).join('&');
      const response = await fetch(
        `https://api.twitch.tv/helix/streams?${params}`,
        {
          headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.statusText}`);
      }

      const data: TwitchStreamResponse = await response.json();

      // All usernames default to offline
      chunk.forEach(username => {
        results.set(username, { isLive: false });
      });

      // Update with live streams
      data.data.forEach(stream => {
        results.set(stream.user_login, {
          isLive: true,
          viewerCount: stream.viewer_count,
          streamTitle: stream.title,
          startedAt: stream.started_at,
        });
      });
    }

    return results;
  } catch (error) {
    console.error('Error batch checking streams:', error);
    throw error;
  }
}
