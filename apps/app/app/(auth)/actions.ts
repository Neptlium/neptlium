"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import {
  isValidEmail,
  meetsPasswordRequirements,
  readRequiredField,
  resolveOrigin,
  safeInternalPath,
} from "./auth-utils";
import { createNotification } from "@netlium/lib";
import { recordSecurityEvent } from "@/lib/security/events";
import { recordTrustedDevice } from "@/lib/security/deviceCookie";
import type { AuthActionState } from "./schema";

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, "email");
  const password = readRequiredField(formData, "password");
  const next = safeInternalPath(readRequiredField(formData, "next"));

  if (!isValidEmail(email)) {
    return {
      error: "Enter a valid email address.",
      success: false,
    };
  }
  if (!password) return { error: "Password is required.", success: false };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      error: "The email or password is incorrect.",
      success: false,
    };
  }

  await recordSecurityEvent(supabase, data.user.id, "login");
  await recordTrustedDevice(supabase, data.user.id);

  if (next !== "/dashboard") redirect(next);

  const { data: profile } = await supabase
    .from("profiles")
    .select("provisioned_at")
    .eq("id", data.user.id)
    .maybeSingle();
  redirect(profile?.provisioned_at ? "/dashboard" : "/onboarding");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = readRequiredField(formData, "firstName");
  const lastName = readRequiredField(formData, "lastName");
  const email = readRequiredField(formData, "email");
  const password = readRequiredField(formData, "password");
  const confirmPassword = readRequiredField(formData, "confirmPassword");
  const acceptedTerms = formData.get("acceptedTerms") === "on";

  if (!firstName) return { error: "First name is required.", success: false };
  if (!lastName) return { error: "Last name is required.", success: false };

  if (!isValidEmail(email)) {
    return {
      error: "Enter a valid email address.",
      success: false,
    };
  }
  if (!password || !confirmPassword)
    return { error: "Password is required.", success: false };

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      success: false,
    };
  }

  if (!meetsPasswordRequirements(password)) {
    return {
      error: "Password must meet all security requirements.",
      success: false,
    };
  }

  if (!acceptedTerms) {
    return {
      error: "You must accept the Terms of Service and Privacy Policy.",
      success: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const origin = await resolveOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    },
  });

  // An account already existing for this email must not be distinguishable
  // from a fresh signup — otherwise the response becomes an account-
  // enumeration oracle. Both paths return the same "check your email" state.
  if (error && !/already registered/i.test(error.message)) {
    return {
      error: "We couldn’t complete the request. Please try again.",
      success: false,
    };
  }

  return {
    error: null,
    success: true,
  };
}

export async function verifyEmailOtp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, "email");
  const token = (formData.get("token") as string | null)?.trim() ?? "";

  if (!isValidEmail(email))
    return { error: "Enter a valid email address.", success: false };
  if (!/^\d{6}$/.test(token))
    return { error: "Enter the 6-digit code from your email.", success: false };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    const msg = error?.message ?? "";
    if (/expired/i.test(msg))
      return { error: "Code expired. Request a new one below.", success: false };
    if (/invalid/i.test(msg) || /not found/i.test(msg))
      return { error: "Incorrect code. Check your email and try again.", success: false };
    if (/rate.?limit/i.test(msg))
      return { error: "Too many attempts. Please wait before trying again.", success: false };
    return { error: "Verification failed. Please try again.", success: false };
  }

  await recordSecurityEvent(supabase, data.user.id, "signup");
  await recordTrustedDevice(supabase, data.user.id);

  redirect("/onboarding");
}

export async function resendVerification(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, "email");
  if (!isValidEmail(email))
    return { error: "Enter a valid email address.", success: false };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return {
      error: /rate.?limit/i.test(error.message)
        ? "Too many attempts. Please wait before trying again."
        : "We couldn’t complete the request. Please try again.",
      success: false,
    };
  }

  return { error: null, success: true, message: "A new code has been sent." };
}

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, "email");

  if (!isValidEmail(email)) {
    return {
      error: "Enter a valid email address.",
      success: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const origin = await resolveOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });

  if (error && /rate limit/i.test(error.message)) {
    return {
      error: "Too many attempts. Please wait before trying again.",
      success: false,
    };
  }

  return {
    error: null,
    success: true,
  };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readRequiredField(formData, "password");
  const confirmPassword = readRequiredField(formData, "confirmPassword");

  if (!password || !confirmPassword) {
    return {
      error: "Password is required.",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      success: false,
    };
  }

  if (!meetsPasswordRequirements(password)) {
    return {
      error: "Password must meet all security requirements.",
      success: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error || !data.user) {
    return {
      error: "Your session has expired. Please sign in again.",
      success: false,
    };
  }

  await recordSecurityEvent(supabase, data.user.id, "password_updated");
  await createNotification(
    supabase,
    data.user.id,
    "security",
    "Password changed",
    "Your account password was updated.",
  );

  redirect("/password-updated");
}
