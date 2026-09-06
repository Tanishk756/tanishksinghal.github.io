/**
 * Centralized Supabase Client for the Private Portfolio CMS.
 * 
 * Uses browser-safe public credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * NEVER includes SUPABASE_SERVICE_ROLE_KEY or GitHub private keys.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'sb_placeholder_anon_key' && SUPABASE_ANON_KEY.length > 20);
};

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
