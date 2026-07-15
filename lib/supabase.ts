import 'react-native-url-polyfill/auto';
import { useMemo, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Anonymous client — use only for genuinely public reads or before the user is
 * authenticated. RLS-protected tables return nothing through this client.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase client authenticated as the current Clerk user via Clerk's **native**
 * Supabase integration (the old JWT-template approach was deprecated 2025-04-01).
 * No template and no shared JWT secret: the client calls `accessToken()` on demand
 * and Clerk returns the session token, whose `sub` claim your RLS policies read
 * through `auth.jwt() ->> 'sub'`.
 *
 * One-time dashboard setup (both required):
 *  1. Clerk Dashboard → Integrations → Supabase → activate → copy the Clerk domain.
 *  2. Supabase Dashboard → Authentication → Sign In / Providers → Third-Party Auth
 *     → add Clerk → paste that domain.
 *
 * IMPORTANT: the client is created **once**. Clerk rotates the session token (and
 * can change `getToken`'s identity) roughly every minute; if we memoized on
 * `getToken`, each rotation would build a new client — and anything keyed on that
 * client (repositories, queries) would tear down and reload, flashing the UI. The
 * ref lets the single stable client always call the latest `getToken`.
 *
 * Usage:
 *   const db = useSupabaseClient();
 *   const { data } = await db.from('your_table').select();
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  return useMemo(
    () =>
      createClient(supabaseUrl, supabaseAnonKey, {
        accessToken: async () => (await getTokenRef.current()) ?? null,
      }),
    [],
  );
}
