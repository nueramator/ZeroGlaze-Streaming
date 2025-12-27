use anchor_lang::prelude::*;
use crate::errors::ZeroglazeError;
use crate::constants::BPS_DENOMINATOR;

/// Calculate fee amount based on basis points
pub fn calculate_fee(amount: u64, fee_bps: u16) -> Result<u64> {
    let fee = (amount as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(ZeroglazeError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(ZeroglazeError::InvalidFee)?;

    Ok(fee as u64)
}

/// Calculate buy cost with fees
pub fn calculate_buy_cost(
    virtual_sol_reserves: u64,
    virtual_token_reserves: u64,
    token_amount: u64,
    is_live: bool,
) -> Result<(u64, u64, u64, u64)> {
    use crate::constants::*;

    // Calculate constant K
    let k: u128 = (virtual_sol_reserves as u128)
        .checked_mul(virtual_token_reserves as u128)
        .ok_or(ZeroglazeError::MathOverflow)?;

    // Calculate new reserves
    let new_virtual_token_reserves = virtual_token_reserves
        .checked_sub(token_amount)
        .ok_or(ZeroglazeError::MathOverflow)?;

    let new_virtual_sol_reserves = (k / new_virtual_token_reserves as u128) as u64;

    let sol_required = new_virtual_sol_reserves
        .checked_sub(virtual_sol_reserves)
        .ok_or(ZeroglazeError::MathOverflow)?;

    // Calculate fees
    let platform_fee = calculate_fee(sol_required, PLATFORM_FEE_BPS)?;
    let creator_fee = if is_live {
        calculate_fee(sol_required, CREATOR_FEE_LIVE_BPS)?
    } else {
        calculate_fee(sol_required, CREATOR_FEE_OFFLINE_BPS)?
    };

    let total_cost = sol_required
        .checked_add(platform_fee)
        .ok_or(ZeroglazeError::MathOverflow)?
        .checked_add(creator_fee)
        .ok_or(ZeroglazeError::MathOverflow)?;

    Ok((sol_required, platform_fee, creator_fee, total_cost))
}

/// Calculate sell output with fees
pub fn calculate_sell_output(
    virtual_sol_reserves: u64,
    virtual_token_reserves: u64,
    token_amount: u64,
    is_live: bool,
) -> Result<(u64, u64, u64, u64)> {
    use crate::constants::*;

    // Calculate constant K
    let k: u128 = (virtual_sol_reserves as u128)
        .checked_mul(virtual_token_reserves as u128)
        .ok_or(ZeroglazeError::MathOverflow)?;

    // Calculate new reserves
    let new_virtual_token_reserves = virtual_token_reserves
        .checked_add(token_amount)
        .ok_or(ZeroglazeError::MathOverflow)?;

    let new_virtual_sol_reserves = (k / new_virtual_token_reserves as u128) as u64;

    let sol_to_return = virtual_sol_reserves
        .checked_sub(new_virtual_sol_reserves)
        .ok_or(ZeroglazeError::MathOverflow)?;

    // Calculate fees
    let platform_fee = calculate_fee(sol_to_return, PLATFORM_FEE_BPS)?;
    let creator_fee = if is_live {
        calculate_fee(sol_to_return, CREATOR_FEE_LIVE_BPS)?
    } else {
        calculate_fee(sol_to_return, CREATOR_FEE_OFFLINE_BPS)?
    };

    let net_output = sol_to_return
        .checked_sub(platform_fee)
        .ok_or(ZeroglazeError::MathOverflow)?
        .checked_sub(creator_fee)
        .ok_or(ZeroglazeError::MathOverflow)?;

    Ok((sol_to_return, platform_fee, creator_fee, net_output))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_fee() {
        // 1% of 1 SOL
        let fee = calculate_fee(1_000_000_000, 100).unwrap();
        assert_eq!(fee, 10_000_000); // 0.01 SOL

        // 2% of 10 SOL
        let fee = calculate_fee(10_000_000_000, 200).unwrap();
        assert_eq!(fee, 200_000_000); // 0.2 SOL
    }

    #[test]
    fn test_buy_cost_calculation() {
        let (sol_required, platform_fee, creator_fee, total) =
            calculate_buy_cost(30_000_000_000, 1_073_000_000, 1_000_000, true).unwrap();

        assert!(sol_required > 0);
        assert_eq!(platform_fee, sol_required / 100); // 1%
        assert_eq!(creator_fee, sol_required * 2 / 100); // 2%
        assert_eq!(total, sol_required + platform_fee + creator_fee);
    }
}
