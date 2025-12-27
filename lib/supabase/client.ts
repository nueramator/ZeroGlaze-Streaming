/**
 * Supabase Client Configuration
 * Handles database connections and real-time subscriptions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Server-side Supabase client (with service role for admin operations)
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Real-time subscription helpers
 */

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

/**
 * Subscribe to token updates
 */
export function subscribeToToken(
  tokenMint: string,
  callback: (token: any) => void
): RealtimeSubscription {
  const channel = supabase
    .channel(`token:${tokenMint}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tokens',
        filter: `token_mint=eq.${tokenMint}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to new trades for a token
 */
export function subscribeToTrades(
  tokenMint: string,
  callback: (trade: any) => void
): RealtimeSubscription {
  const channel = supabase
    .channel(`trades:${tokenMint}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trades',
        filter: `token_mint=eq.${tokenMint}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to all new tokens
 */
export function subscribeToNewTokens(
  callback: (token: any) => void
): RealtimeSubscription {
  const channel = supabase
    .channel('new-tokens')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tokens',
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to stream status changes
 */
export function subscribeToStreamStatus(
  tokenMint: string,
  callback: (isLive: boolean) => void
): RealtimeSubscription {
  const channel = supabase
    .channel(`stream-status:${tokenMint}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tokens',
        filter: `token_mint=eq.${tokenMint}`,
      },
      (payload) => {
        if ('is_live' in payload.new) {
          callback(payload.new.is_live as boolean);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to user's holdings updates
 */
export function subscribeToUserHoldings(
  walletAddress: string,
  callback: (holdings: any[]) => void
): RealtimeSubscription {
  const channel = supabase
    .channel(`holdings:${walletAddress}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_holdings',
        filter: `wallet_address=eq.${walletAddress}`,
      },
      async () => {
        // Fetch updated holdings
        const { data } = await supabase
          .from('user_holdings')
          .select(`
            *,
            tokens (
              token_name,
              token_symbol,
              token_uri,
              current_price
            )
          `)
          .eq('wallet_address', walletAddress);

        if (data) {
          callback(data);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}
