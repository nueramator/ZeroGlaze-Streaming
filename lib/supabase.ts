import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
// Note: Connection managed via Supabase MCP Plugin
// These will be populated when Supabase credentials are configured

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
