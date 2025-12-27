/// Token supply constants
pub const TOTAL_SUPPLY: u64 = 1_000_000_000; // 1 billion
pub const CURVE_SUPPLY: u64 = 800_000_000;   // 800 million tradeable
pub const CREATOR_SUPPLY: u64 = 200_000_000; // 200 million to creator

/// Virtual reserves for bonding curve
pub const VIRTUAL_SOL_INITIAL: u64 = 30_000_000_000; // 30 SOL in lamports
pub const VIRTUAL_TOKEN_INITIAL: u64 = 1_073_000_000; // 1.073 billion tokens

/// Fees in basis points (100 = 1%)
pub const PLATFORM_FEE_BPS: u16 = 100;         // 1%
pub const CREATOR_FEE_LIVE_BPS: u16 = 200;     // 2% when live
pub const CREATOR_FEE_OFFLINE_BPS: u16 = 20;   // 0.2% when offline

/// Graduation thresholds
pub const GRADUATION_THRESHOLD_SOL: u64 = 85_000_000_000; // 85 SOL in lamports
pub const GRADUATION_FEE_SOL: u64 = 6_000_000_000;        // 6 SOL in lamports

/// Precision for calculations
pub const BPS_DENOMINATOR: u64 = 10_000; // 100% = 10,000 basis points
