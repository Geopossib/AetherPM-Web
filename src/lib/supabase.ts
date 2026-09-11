import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// createClient() throws synchronously ("supabaseUrl is required.") if
// given an empty string — and since this module used to call it at
// top-level with `url ?? ""`, a missing/late env var crashed the whole
// app the instant the bundle loaded in the browser (Vercel's generic
// "Application error: a client-side exception has occurred", with no
// indication of why). Guard it so a misconfigured deploy shows a real
// message via <ConfigError /> instead of a blank crash.
export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true } })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
              "in your Vercel project's Environment Variables, then redeploy."
          );
        },
      }
    ) as SupabaseClient);
