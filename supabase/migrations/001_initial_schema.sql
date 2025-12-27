-- Zeroglaze Database Schema
-- Complete schema with RLS policies, triggers, and indexes

-- ============================================================================
-- TABLES
-- ============================================================================

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint TEXT NOT NULL UNIQUE,
    bonding_curve_address TEXT NOT NULL UNIQUE,
    creator_wallet TEXT NOT NULL,

    -- Token metadata
    token_name TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    token_uri TEXT NOT NULL,
    creator_twitter TEXT,
    creator_twitch TEXT,
    freeze_creator_allocation BOOLEAN DEFAULT false,

    -- Trading state
    current_price DECIMAL(20, 10) NOT NULL DEFAULT 0,
    market_cap DECIMAL(20, 4) NOT NULL DEFAULT 0,
    tokens_sold BIGINT NOT NULL DEFAULT 0,
    is_live BOOLEAN DEFAULT false,
    graduated BOOLEAN DEFAULT false,

    -- Volume tracking
    total_volume DECIMAL(20, 4) NOT NULL DEFAULT 0,
    volume_24h DECIMAL(20, 4) DEFAULT 0,
    volume_7d DECIMAL(20, 4) DEFAULT 0,

    -- Price tracking
    price_change_24h DECIMAL(10, 4) DEFAULT 0,
    price_change_7d DECIMAL(10, 4) DEFAULT 0,

    -- Fee tracking
    creator_fees_collected DECIMAL(20, 4) DEFAULT 0,

    -- Stream tracking
    last_stream_check TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CHECK (tokens_sold >= 0),
    CHECK (tokens_sold <= 800000000),
    CHECK (current_price >= 0),
    CHECK (total_volume >= 0)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint TEXT NOT NULL REFERENCES tokens(token_mint) ON DELETE CASCADE,
    trader_wallet TEXT NOT NULL,

    -- Trade details
    trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    token_amount BIGINT NOT NULL CHECK (token_amount > 0),
    sol_amount DECIMAL(20, 10) NOT NULL CHECK (sol_amount > 0),

    -- Fees
    platform_fee DECIMAL(20, 10) NOT NULL,
    creator_fee DECIMAL(20, 10) NOT NULL,
    total_cost DECIMAL(20, 10) NOT NULL,

    -- Price info
    price_per_token DECIMAL(20, 10) NOT NULL,

    -- Blockchain
    transaction_signature TEXT NOT NULL UNIQUE,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream events table
CREATE TABLE IF NOT EXISTS stream_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint TEXT NOT NULL REFERENCES tokens(token_mint) ON DELETE CASCADE,

    -- Event details
    platform TEXT NOT NULL CHECK (platform IN ('twitch', 'youtube')),
    event_type TEXT NOT NULL CHECK (event_type IN ('stream_started', 'stream_ended', 'status_check')),

    -- Stream data
    viewer_count INTEGER,
    stream_title TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User holdings table (for portfolio tracking)
CREATE TABLE IF NOT EXISTS user_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    token_mint TEXT NOT NULL REFERENCES tokens(token_mint) ON DELETE CASCADE,

    -- Holdings
    token_balance BIGINT NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(20, 10),
    total_invested DECIMAL(20, 4) DEFAULT 0,
    realized_profit DECIMAL(20, 4) DEFAULT 0,

    -- Timestamps
    first_purchase_at TIMESTAMPTZ,
    last_trade_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(wallet_address, token_mint),
    CHECK (token_balance >= 0)
);

-- Creator profiles (optional, for verified creators)
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL UNIQUE,

    -- Social profiles
    twitter_username TEXT,
    twitch_username TEXT,
    youtube_channel_id TEXT,

    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,

    -- Stats
    total_tokens_created INTEGER DEFAULT 0,
    total_volume_generated DECIMAL(20, 4) DEFAULT 0,
    total_fees_earned DECIMAL(20, 4) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Tokens indexes
CREATE INDEX idx_tokens_creator ON tokens(creator_wallet);
CREATE INDEX idx_tokens_graduated ON tokens(graduated);
CREATE INDEX idx_tokens_is_live ON tokens(is_live);
CREATE INDEX idx_tokens_created_at ON tokens(created_at DESC);
CREATE INDEX idx_tokens_volume_24h ON tokens(volume_24h DESC);
CREATE INDEX idx_tokens_market_cap ON tokens(market_cap DESC);
CREATE INDEX idx_tokens_price_change ON tokens(price_change_24h DESC);

-- Trades indexes
CREATE INDEX idx_trades_token_mint ON trades(token_mint);
CREATE INDEX idx_trades_trader ON trades(trader_wallet);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_trade_type ON trades(trade_type);
CREATE INDEX idx_trades_token_trader ON trades(token_mint, trader_wallet);

-- Stream events indexes
CREATE INDEX idx_stream_events_token ON stream_events(token_mint);
CREATE INDEX idx_stream_events_created_at ON stream_events(created_at DESC);

-- User holdings indexes
CREATE INDEX idx_user_holdings_wallet ON user_holdings(wallet_address);
CREATE INDEX idx_user_holdings_token ON user_holdings(token_mint);
CREATE INDEX idx_user_holdings_balance ON user_holdings(token_balance DESC);

-- Creator profiles indexes
CREATE INDEX idx_creator_profiles_verified ON creator_profiles(is_verified);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update token stats after buy
CREATE OR REPLACE FUNCTION update_token_after_buy(
    p_token_mint TEXT,
    p_tokens_sold BIGINT,
    p_sol_amount DECIMAL,
    p_new_price DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE tokens
    SET
        tokens_sold = tokens_sold + p_tokens_sold,
        current_price = p_new_price,
        market_cap = p_new_price * 1000000000, -- Total supply
        total_volume = total_volume + p_sol_amount,
        updated_at = NOW()
    WHERE token_mint = p_token_mint;
END;
$$ LANGUAGE plpgsql;

-- Update token stats after sell
CREATE OR REPLACE FUNCTION update_token_after_sell(
    p_token_mint TEXT,
    p_tokens_sold BIGINT,
    p_sol_amount DECIMAL,
    p_new_price DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE tokens
    SET
        tokens_sold = tokens_sold - p_tokens_sold,
        current_price = p_new_price,
        market_cap = p_new_price * 1000000000,
        total_volume = total_volume + p_sol_amount,
        updated_at = NOW()
    WHERE token_mint = p_token_mint;
END;
$$ LANGUAGE plpgsql;

-- Calculate 24h volume (called periodically by cron)
CREATE OR REPLACE FUNCTION update_24h_metrics()
RETURNS VOID AS $$
BEGIN
    -- Update 24h volume
    UPDATE tokens t
    SET volume_24h = COALESCE(
        (
            SELECT SUM(sol_amount)
            FROM trades
            WHERE token_mint = t.token_mint
            AND created_at > NOW() - INTERVAL '24 hours'
        ),
        0
    );

    -- Update 24h price change
    UPDATE tokens t
    SET price_change_24h = CASE
        WHEN (
            SELECT price_per_token
            FROM trades
            WHERE token_mint = t.token_mint
            AND created_at < NOW() - INTERVAL '24 hours'
            ORDER BY created_at DESC
            LIMIT 1
        ) > 0 THEN
            (
                (t.current_price - (
                    SELECT price_per_token
                    FROM trades
                    WHERE token_mint = t.token_mint
                    AND created_at < NOW() - INTERVAL '24 hours'
                    ORDER BY created_at DESC
                    LIMIT 1
                )) / (
                    SELECT price_per_token
                    FROM trades
                    WHERE token_mint = t.token_mint
                    AND created_at < NOW() - INTERVAL '24 hours'
                    ORDER BY created_at DESC
                    LIMIT 1
                ) * 100
            )
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- Update user holdings after trade
CREATE OR REPLACE FUNCTION update_user_holdings()
RETURNS TRIGGER AS $$
DECLARE
    v_token_balance BIGINT;
    v_avg_price DECIMAL;
BEGIN
    IF NEW.trade_type = 'buy' THEN
        -- Insert or update holdings
        INSERT INTO user_holdings (
            wallet_address,
            token_mint,
            token_balance,
            average_buy_price,
            total_invested,
            first_purchase_at,
            last_trade_at
        )
        VALUES (
            NEW.trader_wallet,
            NEW.token_mint,
            NEW.token_amount,
            NEW.price_per_token,
            NEW.total_cost,
            NEW.created_at,
            NEW.created_at
        )
        ON CONFLICT (wallet_address, token_mint)
        DO UPDATE SET
            token_balance = user_holdings.token_balance + NEW.token_amount,
            average_buy_price = (
                (user_holdings.average_buy_price * user_holdings.token_balance) +
                (NEW.price_per_token * NEW.token_amount)
            ) / (user_holdings.token_balance + NEW.token_amount),
            total_invested = user_holdings.total_invested + NEW.total_cost,
            last_trade_at = NEW.created_at,
            updated_at = NOW();
    ELSE
        -- Sell: reduce holdings
        UPDATE user_holdings
        SET
            token_balance = token_balance - NEW.token_amount,
            realized_profit = realized_profit + (
                (NEW.price_per_token - average_buy_price) * NEW.token_amount
            ),
            last_trade_at = NEW.created_at,
            updated_at = NOW()
        WHERE wallet_address = NEW.trader_wallet
        AND token_mint = NEW.token_mint;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at column
CREATE TRIGGER update_tokens_updated_at
    BEFORE UPDATE ON tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_holdings_updated_at
    BEFORE UPDATE ON user_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update user holdings after trade
CREATE TRIGGER after_trade_insert
    AFTER INSERT ON trades
    FOR EACH ROW
    EXECUTE FUNCTION update_user_holdings();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

-- Tokens: Public read, authenticated insert/update
CREATE POLICY "Tokens are viewable by everyone"
    ON tokens FOR SELECT
    USING (true);

CREATE POLICY "Tokens can be created by authenticated users"
    ON tokens FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tokens can be updated by creator or system"
    ON tokens FOR UPDATE
    USING (
        auth.uid()::text = creator_wallet OR
        auth.role() = 'service_role'
    );

-- Trades: Public read, authenticated insert
CREATE POLICY "Trades are viewable by everyone"
    ON trades FOR SELECT
    USING (true);

CREATE POLICY "Trades can be created by authenticated users"
    ON trades FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Stream events: Public read, system insert
CREATE POLICY "Stream events are viewable by everyone"
    ON stream_events FOR SELECT
    USING (true);

CREATE POLICY "Stream events can be created by system"
    ON stream_events FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- User holdings: Users can only see their own
CREATE POLICY "Users can view their own holdings"
    ON user_holdings FOR SELECT
    USING (auth.uid()::text = wallet_address);

CREATE POLICY "Holdings can be updated by system"
    ON user_holdings FOR ALL
    USING (auth.role() = 'service_role');

-- Creator profiles: Public read, owner update
CREATE POLICY "Creator profiles are viewable by everyone"
    ON creator_profiles FOR SELECT
    USING (true);

CREATE POLICY "Creators can update their own profile"
    ON creator_profiles FOR UPDATE
    USING (auth.uid()::text = wallet_address);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Trending tokens view (most volume in 24h)
CREATE OR REPLACE VIEW trending_tokens AS
SELECT
    t.*,
    COUNT(tr.id) as trade_count_24h,
    COUNT(DISTINCT tr.trader_wallet) as unique_traders_24h
FROM tokens t
LEFT JOIN trades tr ON t.token_mint = tr.token_mint
    AND tr.created_at > NOW() - INTERVAL '24 hours'
WHERE t.graduated = false
GROUP BY t.id
ORDER BY t.volume_24h DESC;

-- Creator leaderboard view
CREATE OR REPLACE VIEW creator_leaderboard AS
SELECT
    creator_wallet,
    COUNT(*) as tokens_created,
    SUM(total_volume) as total_volume,
    SUM(creator_fees_collected) as total_fees_earned,
    COUNT(CASE WHEN graduated THEN 1 END) as graduated_tokens,
    AVG(volume_24h) as avg_volume_per_token
FROM tokens
GROUP BY creator_wallet
ORDER BY total_volume DESC;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert platform configuration (if needed)
-- This would store global platform settings

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tokens IS 'Stores all tokens created on the platform';
COMMENT ON TABLE trades IS 'Records all buy/sell transactions';
COMMENT ON TABLE stream_events IS 'Logs stream status changes';
COMMENT ON TABLE user_holdings IS 'Tracks user token balances and performance';
COMMENT ON TABLE creator_profiles IS 'Stores creator information and verification';
