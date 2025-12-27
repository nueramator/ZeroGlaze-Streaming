use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer, FreezeAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("ZERO11111111111111111111111111111111111111111");

pub mod state;
pub mod errors;
pub mod constants;
pub mod utils;

use state::*;
use errors::*;
use constants::*;
use utils::*;

#[program]
pub mod zeroglaze {
    use super::*;

    /// Initialize the global platform state (one-time setup)
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        platform_fee_wallet: Pubkey,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.authority = ctx.accounts.authority.key();
        platform_state.platform_fee_wallet = platform_fee_wallet;
        platform_state.total_tokens_launched = 0;
        platform_state.total_volume_sol = 0;
        platform_state.total_fees_collected = 0;
        platform_state.bump = ctx.bumps.platform_state;

        msg!("Platform initialized with authority: {}", ctx.accounts.authority.key());
        Ok(())
    }

    /// Create a new token with bonding curve
    pub fn create_token(
        ctx: Context<CreateToken>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        creator_twitter: String,
        creator_twitch: String,
        freeze_creator_allocation: bool,
    ) -> Result<()> {
        require!(token_name.len() <= 32, ZeroglazeError::NameTooLong);
        require!(token_symbol.len() <= 10, ZeroglazeError::SymbolTooLong);
        require!(token_uri.len() <= 200, ZeroglazeError::UriTooLong);

        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Initialize bonding curve state
        bonding_curve.creator = ctx.accounts.creator.key();
        bonding_curve.token_mint = ctx.accounts.token_mint.key();
        bonding_curve.token_name = token_name;
        bonding_curve.token_symbol = token_symbol;
        bonding_curve.token_uri = token_uri;
        bonding_curve.creator_twitter = creator_twitter;
        bonding_curve.creator_twitch = creator_twitch;
        bonding_curve.freeze_creator_allocation = freeze_creator_allocation;

        bonding_curve.virtual_sol_reserves = VIRTUAL_SOL_INITIAL;
        bonding_curve.virtual_token_reserves = VIRTUAL_TOKEN_INITIAL;
        bonding_curve.real_sol_reserves = 0;
        bonding_curve.real_token_reserves = CURVE_SUPPLY;

        bonding_curve.tokens_sold = 0;
        bonding_curve.is_live_streaming = false;
        bonding_curve.last_stream_check = clock.unix_timestamp;
        bonding_curve.graduated = false;
        bonding_curve.total_volume = 0;
        bonding_curve.creator_fees_collected = 0;

        bonding_curve.created_at = clock.unix_timestamp;
        bonding_curve.bump = ctx.bumps.bonding_curve;

        // Mint total supply
        let mint_seeds = &[
            b"token_mint",
            bonding_curve.creator.as_ref(),
            &[ctx.bumps.token_mint],
        ];
        let signer = &[&mint_seeds[..]];

        // Mint curve supply to curve token account
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.curve_token_account.to_account_info(),
                    authority: ctx.accounts.token_mint.to_account_info(),
                },
                signer,
            ),
            CURVE_SUPPLY,
        )?;

        // Mint creator supply to creator token account
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.token_mint.to_account_info(),
                },
                signer,
            ),
            CREATOR_SUPPLY,
        )?;

        // Freeze creator tokens if requested
        if freeze_creator_allocation {
            token::freeze_account(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    FreezeAccount {
                        account: ctx.accounts.creator_token_account.to_account_info(),
                        mint: ctx.accounts.token_mint.to_account_info(),
                        authority: ctx.accounts.token_mint.to_account_info(),
                    },
                    signer,
                ),
            )?;
            msg!("Creator tokens frozen until graduation");
        }

        // Update platform state
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_tokens_launched += 1;

        msg!("Token created: {} ({})", bonding_curve.token_name, bonding_curve.token_symbol);
        msg!("Creator allocation frozen: {}", freeze_creator_allocation);

        Ok(())
    }

    /// Buy tokens from bonding curve
    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        token_amount: u64,
        max_sol_cost: u64,
    ) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;

        require!(!bonding_curve.graduated, ZeroglazeError::TokenGraduated);
        require!(token_amount > 0, ZeroglazeError::InvalidAmount);
        require!(
            bonding_curve.tokens_sold + token_amount <= CURVE_SUPPLY,
            ZeroglazeError::InsufficientCurveSupply
        );

        // Calculate cost using constant product formula
        let k: u128 = (bonding_curve.virtual_sol_reserves as u128)
            .checked_mul(bonding_curve.virtual_token_reserves as u128)
            .ok_or(ZeroglazeError::MathOverflow)?;

        let new_virtual_token_reserves = bonding_curve.virtual_token_reserves
            .checked_sub(token_amount)
            .ok_or(ZeroglazeError::MathOverflow)?;

        let new_virtual_sol_reserves = (k / new_virtual_token_reserves as u128) as u64;

        let sol_required = new_virtual_sol_reserves
            .checked_sub(bonding_curve.virtual_sol_reserves)
            .ok_or(ZeroglazeError::MathOverflow)?;

        // Calculate fees
        let platform_fee = calculate_fee(sol_required, PLATFORM_FEE_BPS)?;
        let creator_fee = if bonding_curve.is_live_streaming {
            calculate_fee(sol_required, CREATOR_FEE_LIVE_BPS)?
        } else {
            calculate_fee(sol_required, CREATOR_FEE_OFFLINE_BPS)?
        };

        let total_cost = sol_required
            .checked_add(platform_fee)
            .ok_or(ZeroglazeError::MathOverflow)?
            .checked_add(creator_fee)
            .ok_or(ZeroglazeError::MathOverflow)?;

        require!(total_cost <= max_sol_cost, ZeroglazeError::SlippageExceeded);

        // Transfer SOL from buyer to curve (real reserves)
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.curve_sol_vault.to_account_info(),
                },
            ),
            sol_required,
        )?;

        // Transfer platform fee
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.platform_fee_wallet.to_account_info(),
                },
            ),
            platform_fee,
        )?;

        // Transfer creator fee
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.creator_fee_wallet.to_account_info(),
                },
            ),
            creator_fee,
        )?;

        // Transfer tokens from curve to buyer
        let curve_seeds = &[
            b"bonding_curve",
            bonding_curve.creator.as_ref(),
            bonding_curve.token_mint.as_ref(),
            &[bonding_curve.bump],
        ];
        let signer = &[&curve_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.curve_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.bonding_curve.to_account_info(),
                },
                signer,
            ),
            token_amount,
        )?;

        // Update bonding curve state
        bonding_curve.virtual_sol_reserves = new_virtual_sol_reserves;
        bonding_curve.virtual_token_reserves = new_virtual_token_reserves;
        bonding_curve.real_sol_reserves += sol_required;
        bonding_curve.real_token_reserves -= token_amount;
        bonding_curve.tokens_sold += token_amount;
        bonding_curve.total_volume += total_cost;
        bonding_curve.creator_fees_collected += creator_fee;

        // Update platform state
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_volume_sol += total_cost;
        platform_state.total_fees_collected += platform_fee + creator_fee;

        // Check for graduation
        if bonding_curve.real_sol_reserves >= GRADUATION_THRESHOLD_SOL {
            bonding_curve.graduated = true;
            msg!("Token graduated to DEX!");
        }

        msg!("Buy executed: {} tokens for {} SOL (+ {} fees)",
            token_amount, sol_required, platform_fee + creator_fee);

        Ok(())
    }

    /// Sell tokens to bonding curve
    pub fn sell_tokens(
        ctx: Context<SellTokens>,
        token_amount: u64,
        min_sol_output: u64,
    ) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;

        require!(!bonding_curve.graduated, ZeroglazeError::TokenGraduated);
        require!(token_amount > 0, ZeroglazeError::InvalidAmount);

        // Calculate SOL to return using constant product formula
        let k: u128 = (bonding_curve.virtual_sol_reserves as u128)
            .checked_mul(bonding_curve.virtual_token_reserves as u128)
            .ok_or(ZeroglazeError::MathOverflow)?;

        let new_virtual_token_reserves = bonding_curve.virtual_token_reserves
            .checked_add(token_amount)
            .ok_or(ZeroglazeError::MathOverflow)?;

        let new_virtual_sol_reserves = (k / new_virtual_token_reserves as u128) as u64;

        let sol_to_return = bonding_curve.virtual_sol_reserves
            .checked_sub(new_virtual_sol_reserves)
            .ok_or(ZeroglazeError::MathOverflow)?;

        // Calculate fees
        let platform_fee = calculate_fee(sol_to_return, PLATFORM_FEE_BPS)?;
        let creator_fee = if bonding_curve.is_live_streaming {
            calculate_fee(sol_to_return, CREATOR_FEE_LIVE_BPS)?
        } else {
            calculate_fee(sol_to_return, CREATOR_FEE_OFFLINE_BPS)?
        };

        let net_sol_output = sol_to_return
            .checked_sub(platform_fee)
            .ok_or(ZeroglazeError::MathOverflow)?
            .checked_sub(creator_fee)
            .ok_or(ZeroglazeError::MathOverflow)?;

        require!(net_sol_output >= min_sol_output, ZeroglazeError::SlippageExceeded);
        require!(
            bonding_curve.real_sol_reserves >= sol_to_return,
            ZeroglazeError::InsufficientLiquidity
        );

        // Transfer tokens from seller to curve
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    to: ctx.accounts.curve_token_account.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            token_amount,
        )?;

        // Transfer SOL from curve to seller
        let curve_seeds = &[
            b"bonding_curve",
            bonding_curve.creator.as_ref(),
            bonding_curve.token_mint.as_ref(),
            &[bonding_curve.bump],
        ];
        let signer = &[&curve_seeds[..]];

        **ctx.accounts.curve_sol_vault.to_account_info().try_borrow_mut_lamports()? -= net_sol_output;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += net_sol_output;

        // Transfer fees
        **ctx.accounts.curve_sol_vault.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
        **ctx.accounts.platform_fee_wallet.to_account_info().try_borrow_mut_lamports()? += platform_fee;

        **ctx.accounts.curve_sol_vault.to_account_info().try_borrow_mut_lamports()? -= creator_fee;
        **ctx.accounts.creator_fee_wallet.to_account_info().try_borrow_mut_lamports()? += creator_fee;

        // Update bonding curve state
        bonding_curve.virtual_sol_reserves = new_virtual_sol_reserves;
        bonding_curve.virtual_token_reserves = new_virtual_token_reserves;
        bonding_curve.real_sol_reserves -= sol_to_return;
        bonding_curve.real_token_reserves += token_amount;
        bonding_curve.tokens_sold -= token_amount;
        bonding_curve.total_volume += sol_to_return;
        bonding_curve.creator_fees_collected += creator_fee;

        // Update platform state
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_volume_sol += sol_to_return;
        platform_state.total_fees_collected += platform_fee + creator_fee;

        msg!("Sell executed: {} tokens for {} SOL (- {} fees)",
            token_amount, sol_to_return, platform_fee + creator_fee);

        Ok(())
    }

    /// Update stream status (called by backend via keeper wallet)
    pub fn update_stream_status(
        ctx: Context<UpdateStreamStatus>,
        is_live: bool,
    ) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        bonding_curve.is_live_streaming = is_live;
        bonding_curve.last_stream_check = clock.unix_timestamp;

        msg!("Stream status updated: {}", if is_live { "LIVE" } else { "OFFLINE" });

        Ok(())
    }

    /// Withdraw creator fees (only creator can call)
    pub fn withdraw_creator_fees(
        ctx: Context<WithdrawCreatorFees>,
    ) -> Result<()> {
        let bonding_curve = &ctx.accounts.bonding_curve;
        let available_balance = ctx.accounts.creator_fee_wallet.lamports();

        require!(available_balance > 0, ZeroglazeError::NoFeesToWithdraw);

        // Transfer all available fees to creator
        **ctx.accounts.creator_fee_wallet.to_account_info().try_borrow_mut_lamports()? -= available_balance;
        **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += available_balance;

        msg!("Creator withdrew {} SOL in fees", available_balance as f64 / 1e9);

        Ok(())
    }
}

// ============================================================================
// Context Structs
// ============================================================================

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PlatformState::INIT_SPACE,
        seeds = [b"platform_state"],
        bump
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + BondingCurve::INIT_SPACE,
        seeds = [b"bonding_curve", creator.key().as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = token_mint,
        mint::freeze_authority = token_mint,
        seeds = [b"token_mint", creator.key().as_ref()],
        bump
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = token_mint,
        associated_token::authority = bonding_curve,
    )]
    pub curve_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = token_mint,
        associated_token::authority = creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"platform_state"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = bonding_curve,
    )]
    pub curve_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"curve_sol_vault", bonding_curve.key().as_ref()],
        bump
    )]
    /// CHECK: PDA for holding SOL reserves
    pub curve_sol_vault: AccountInfo<'info>,

    #[account(mut)]
    pub platform_fee_wallet: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"creator_fee_wallet", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump
    )]
    /// CHECK: PDA for collecting creator fees
    pub creator_fee_wallet: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"platform_state"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SellTokens<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = bonding_curve,
    )]
    pub curve_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"curve_sol_vault", bonding_curve.key().as_ref()],
        bump
    )]
    /// CHECK: PDA for holding SOL reserves
    pub curve_sol_vault: AccountInfo<'info>,

    #[account(mut)]
    pub platform_fee_wallet: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"creator_fee_wallet", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump
    )]
    /// CHECK: PDA for collecting creator fees
    pub creator_fee_wallet: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"platform_state"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateStreamStatus<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        constraint = authority.key() == platform_state.authority @ ZeroglazeError::Unauthorized
    )]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"platform_state"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
}

#[derive(Accounts)]
pub struct WithdrawCreatorFees<'info> {
    #[account(
        seeds = [b"bonding_curve", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump = bonding_curve.bump,
        constraint = bonding_curve.creator == creator.key() @ ZeroglazeError::Unauthorized
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        mut,
        seeds = [b"creator_fee_wallet", bonding_curve.creator.as_ref(), bonding_curve.token_mint.as_ref()],
        bump
    )]
    /// CHECK: PDA for collecting creator fees
    pub creator_fee_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}
