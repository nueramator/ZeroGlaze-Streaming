-- Seed data for MVP testing
-- Migration: 002 - Seed Data

-- Insert test streamers
INSERT INTO streamers (wallet_address, platform, platform_user_id, platform_username, display_name, is_verified)
VALUES
  ('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'twitch', 'streamer_one', 'streamer_one', 'StreamerOne', true),
  ('8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV', 'twitch', 'gamer_pro', 'gamer_pro', 'GamerPro', true),
  ('9zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW', 'twitch', 'speedrunner', 'speedrunner', 'Speedrunner', true)
ON CONFLICT (platform, platform_user_id) DO NOTHING;

-- Insert test tokens
INSERT INTO tokens (mint_address, streamer_id, token_name, token_symbol, initial_supply, current_supply, freeze_authority)
SELECT
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  s.id,
  'StreamerOne Token',
  'SO1',
  1000000,
  1000000,
  false
FROM streamers s
WHERE s.platform_user_id = 'streamer_one'
ON CONFLICT (mint_address) DO NOTHING;

INSERT INTO tokens (mint_address, streamer_id, token_name, token_symbol, initial_supply, current_supply, freeze_authority)
SELECT
  '8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
  s.id,
  'GamerPro Token',
  'GPT',
  1000000,
  1000000,
  false
FROM streamers s
WHERE s.platform_user_id = 'gamer_pro'
ON CONFLICT (mint_address) DO NOTHING;

INSERT INTO tokens (mint_address, streamer_id, token_name, token_symbol, initial_supply, current_supply, freeze_authority)
SELECT
  '9zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW',
  s.id,
  'Speedrun Token',
  'SPD',
  1000000,
  1000000,
  false
FROM streamers s
WHERE s.platform_user_id = 'speedrunner'
ON CONFLICT (mint_address) DO NOTHING;

-- Insert test stream status
INSERT INTO stream_status (streamer_id, is_live, viewer_count, stream_title)
SELECT
  s.id,
  true,
  156,
  'Speedrunning Dark Souls'
FROM streamers s
WHERE s.platform_user_id = 'streamer_one'
ON CONFLICT (streamer_id) DO NOTHING;

INSERT INTO stream_status (streamer_id, is_live, viewer_count)
SELECT
  s.id,
  false,
  0
FROM streamers s
WHERE s.platform_user_id = 'gamer_pro'
ON CONFLICT (streamer_id) DO NOTHING;

INSERT INTO stream_status (streamer_id, is_live, viewer_count, stream_title)
SELECT
  s.id,
  true,
  342,
  'World Record Attempts'
FROM streamers s
WHERE s.platform_user_id = 'speedrunner'
ON CONFLICT (streamer_id) DO NOTHING;
