import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import type { Database } from "@/lib/supabase/database.types";

function getEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env.${name}`);
  }

  return value;
}

export function createClient() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabasePublishableKey = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const hostname =
    typeof window === "undefined" ? undefined : window.location.hostname;

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookieOptions: getSupabaseCookieOptions(hostname),
  });
}
