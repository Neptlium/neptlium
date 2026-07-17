import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in the browser.
 * Safe to call multiple times; @supabase/ssr manages cookie-based session storage.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export const supabaseBrowser = createSupabaseBrowserClient();
