use anchor_lang::prelude::*;

#[error_code]
pub enum ZeroglazeError {
    #[msg("Token name is too long (max 32 characters)")]
    NameTooLong,

    #[msg("Token symbol is too long (max 10 characters)")]
    SymbolTooLong,

    #[msg("Token URI is too long (max 200 characters)")]
    UriTooLong,

    #[msg("Invalid token amount")]
    InvalidAmount,

    #[msg("Insufficient curve supply")]
    InsufficientCurveSupply,

    #[msg("Insufficient liquidity in curve")]
    InsufficientLiquidity,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,

    #[msg("Token has already graduated to DEX")]
    TokenGraduated,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("No fees available to withdraw")]
    NoFeesToWithdraw,

    #[msg("Invalid fee calculation")]
    InvalidFee,
}
