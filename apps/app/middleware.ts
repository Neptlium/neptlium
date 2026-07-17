import { updateSession } from "@netlium/lib/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * Runs on every matched request. Calls updateSession so Supabase can
 * refresh the access token (via the refresh token) when it has expired
 * and write the updated cookies to the response.
 *
 * Without this middleware, Server Components would receive stale session
 * cookies and users would appear logged-out after ~1 hour.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - Next.js static files (_next/static, _next/image)
     *  - favicon.ico
     *  - Public image assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
