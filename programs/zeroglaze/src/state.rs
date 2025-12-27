use anchor_lang::prelude::*;

/// Global platform state
#[account]
#[derive(InitSpace)]
pub struct PlatformState {
    pub authority: Pubkey,
    pub platform_fee_wallet: Pubkey,
    pub total_tokens_launched: u64,
    pub total_volume_sol: u64,
    pub total_fees_collected: u64,
    pub bump: u8,
}

/// Bonding curve state for each token
#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    // Token metadata
    pub creator: Pubkey,
    pub token_mint: Pubkey,

    #[max_len(32)]
    pub token_name: String,

    #[max_len(10)]
    pub token_symbol: String,

    #[max_len(200)]
    pub token_uri: String,

    #[max_len(32)]
    pub creator_twitter: String,

    #[max_len(32)]
    pub creator_twitch: String,

    pub freeze_creator_allocation: bool,

    // Bonding curve parameters
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,

    // Trading stats
    pub tokens_sold: u64,
    pub total_volume: u64,
    pub creator_fees_collected: u64,

    // Stream status
    pub is_live_streaming: bool,
    pub last_stream_check: i64,

    // Graduation
    pub graduated: bool,

    // Metadata
    pub created_at: i64,
    pub bump: u8,
}

impl BondingCurve {
    /// Calculate current price per token in lamports
    pub fn get_current_price(&self) -> Result<u64> {
        if self.virtual_token_reserves == 0 {
            return Ok(0);
        }
        Ok(self.virtual_sol_reserves
            .checked_div(self.virtual_token_reserves)
            .unwrap_or(0))
    }

    /// Calculate market cap in SOL
    pub fn get_market_cap(&self) -> Result<f64> {
        let price_per_token = self.get_current_price()? as f64 / 1e9;
        let total_supply = 1_000_000_000.0;
        Ok(price_per_token * total_supply)
    }

    /// Get trading progress (0-100%)
    pub fn get_progress(&self) -> u8 {
        ((self.tokens_sold as f64 / 800_000_000.0) * 100.0) as u8
    }
}
