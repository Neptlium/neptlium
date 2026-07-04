import type { Session } from "@supabase/supabase-js";

type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED";

export function createSessionHandler() {
  return async (_event: AuthEvent | unknown, session: Session | null) => {
    if (!session) return;

    // safe placeholder hook for now
    console.log("session updated:", {
      user: session.user?.id,
      event: _event
    });
  };
}