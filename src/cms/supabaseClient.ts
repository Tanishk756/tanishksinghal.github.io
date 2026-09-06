/**
 * Centralized Supabase Client for the Private Portfolio CMS.
 * 
 * Uses browser-safe public credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * NEVER includes SUPABASE_SERVICE_ROLE_KEY or GitHub private keys.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fpjaijgbcdalrdgwbece.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_placeholder_anon_key';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://fpjaijgbcdalrdgwbece.supabase.co',
  SUPABASE_ANON_KEY || 'sb_placeholder_anon_key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && key !== 'sb_placeholder_anon_key');
};
