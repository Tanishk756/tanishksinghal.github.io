/**
 * Centralized Supabase Client for the Private Portfolio CMS.
 * 
 * Uses browser-safe public credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * NEVER includes SUPABASE_SERVICE_ROLE_KEY or GitHub private keys.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JesQqbucqA9FIKK04_1mrw_nnmkSq-S';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return Boolean(url && key && key !== 'sb_placeholder_anon_key' && key.length > 20);
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
