import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { recordSecurityEvent } from "@/lib/security/events";
import { recordTrustedDevice } from "@/lib/security/deviceCookie";

/**
 * Landing target for Supabase's signup confirmation and password-recovery
 * email links. Not under (auth) — the link must resolve to a stable,
 * non-route-group path. verifyOtp establishes the session cookie here (route
 * handlers, unlike Server Components, can write cookies).
 *
 * Recovery links land on /update-password to set a new credential; every
 * other type redirects to /dashboard, whose provisioning gate
 * (requireProvisionedUser) is the single place that decides whether an
 * authenticated user still needs to complete /onboarding.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error && data.user) {
      if (type === "signup") {
        await recordSecurityEvent(supabase, data.user.id, "signup");
      }
      await recordTrustedDevice(supabase, data.user.id);

      const destination =
        type === "recovery" ? "/update-password" : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth-error", request.url));
}
