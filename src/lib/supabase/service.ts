import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Initialized on first use, not at import time. Next collects page data for
// route handlers during `next build`, which imports this module — so reading
// (and validating) env at module scope hard-fails any build that doesn't have
// the Supabase vars present, e.g. a bare `docker build`. The service client is
// only ever needed while serving a request, by which point env is populated.
let client: SupabaseClient | null = null;

export function getSupabaseService(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");

  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
