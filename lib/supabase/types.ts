/**
 * Supabase Database Types
 * Auto-generated types for type-safe database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tokens: {
        Row: {
          id: string
          token_mint: string
          bonding_curve_address: string
          creator_wallet: string
          token_name: string
          token_symbol: string
          token_uri: string
          creator_twitter: string | null
          creator_twitch: string | null
          freeze_creator_allocation: boolean
          current_price: number
          market_cap: number
          tokens_sold: number
          is_live: boolean
          graduated: boolean
          total_volume: number
          volume_24h: number | null
          volume_7d: number | null
          price_change_24h: number | null
          price_change_7d: number | null
          creator_fees_collected: number | null
          last_stream_check: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          token_mint: string
          bonding_curve_address: string
          creator_wallet: string
          token_name: string
          token_symbol: string
          token_uri: string
          creator_twitter?: string | null
          creator_twitch?: string | null
          freeze_creator_allocation?: boolean
          current_price?: number
          market_cap?: number
          tokens_sold?: number
          is_live?: boolean
          graduated?: boolean
          total_volume?: number
          volume_24h?: number | null
          volume_7d?: number | null
          price_change_24h?: number | null
          price_change_7d?: number | null
          creator_fees_collected?: number | null
          last_stream_check?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          token_mint?: string
          bonding_curve_address?: string
          creator_wallet?: string
          token_name?: string
          token_symbol?: string
          token_uri?: string
          creator_twitter?: string | null
          creator_twitch?: string | null
          freeze_creator_allocation?: boolean
          current_price?: number
          market_cap?: number
          tokens_sold?: number
          is_live?: boolean
          graduated?: boolean
          total_volume?: number
          volume_24h?: number | null
          volume_7d?: number | null
          price_change_24h?: number | null
          price_change_7d?: number | null
          creator_fees_collected?: number | null
          last_stream_check?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          token_mint: string
          trader_wallet: string
          trade_type: 'buy' | 'sell'
          token_amount: number
          sol_amount: number
          platform_fee: number
          creator_fee: number
          total_cost: number
          price_per_token: number
          transaction_signature: string
          created_at: string
        }
        Insert: {
          id?: string
          token_mint: string
          trader_wallet: string
          trade_type: 'buy' | 'sell'
          token_amount: number
          sol_amount: number
          platform_fee: number
          creator_fee: number
          total_cost: number
          price_per_token: number
          transaction_signature: string
          created_at?: string
        }
        Update: {
          id?: string
          token_mint?: string
          trader_wallet?: string
          trade_type?: 'buy' | 'sell'
          token_amount?: number
          sol_amount?: number
          platform_fee?: number
          creator_fee?: number
          total_cost?: number
          price_per_token?: number
          transaction_signature?: string
          created_at?: string
        }
      }
      stream_events: {
        Row: {
          id: string
          token_mint: string
          platform: 'twitch' | 'youtube'
          event_type: 'stream_started' | 'stream_ended' | 'status_check'
          viewer_count: number | null
          stream_title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          token_mint: string
          platform: 'twitch' | 'youtube'
          event_type: 'stream_started' | 'stream_ended' | 'status_check'
          viewer_count?: number | null
          stream_title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          token_mint?: string
          platform?: 'twitch' | 'youtube'
          event_type?: 'stream_started' | 'stream_ended' | 'status_check'
          viewer_count?: number | null
          stream_title?: string | null
          created_at?: string
        }
      }
      user_holdings: {
        Row: {
          id: string
          wallet_address: string
          token_mint: string
          token_balance: number
          average_buy_price: number | null
          total_invested: number
          realized_profit: number
          first_purchase_at: string | null
          last_trade_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          token_mint: string
          token_balance?: number
          average_buy_price?: number | null
          total_invested?: number
          realized_profit?: number
          first_purchase_at?: string | null
          last_trade_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          token_mint?: string
          token_balance?: number
          average_buy_price?: number | null
          total_invested?: number
          realized_profit?: number
          first_purchase_at?: string | null
          last_trade_at?: string | null
          updated_at?: string
        }
      }
      creator_profiles: {
        Row: {
          id: string
          wallet_address: string
          twitter_username: string | null
          twitch_username: string | null
          youtube_channel_id: string | null
          is_verified: boolean
          verified_at: string | null
          total_tokens_created: number
          total_volume_generated: number
          total_fees_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          twitter_username?: string | null
          twitch_username?: string | null
          youtube_channel_id?: string | null
          is_verified?: boolean
          verified_at?: string | null
          total_tokens_created?: number
          total_volume_generated?: number
          total_fees_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          twitter_username?: string | null
          twitch_username?: string | null
          youtube_channel_id?: string | null
          is_verified?: boolean
          verified_at?: string | null
          total_tokens_created?: number
          total_volume_generated?: number
          total_fees_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      trending_tokens: {
        Row: {
          id: string
          token_mint: string
          token_name: string
          token_symbol: string
          volume_24h: number
          trade_count_24h: number
          unique_traders_24h: number
        }
      }
      creator_leaderboard: {
        Row: {
          creator_wallet: string
          tokens_created: number
          total_volume: number
          total_fees_earned: number
          graduated_tokens: number
          avg_volume_per_token: number
        }
      }
    }
    Functions: {
      update_token_after_buy: {
        Args: {
          p_token_mint: string
          p_tokens_sold: number
          p_sol_amount: number
          p_new_price: number
        }
        Returns: void
      }
      update_token_after_sell: {
        Args: {
          p_token_mint: string
          p_tokens_sold: number
          p_sol_amount: number
          p_new_price: number
        }
        Returns: void
      }
      update_24h_metrics: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
  }
}
