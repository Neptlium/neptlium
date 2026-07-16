import { headers } from "next/headers";

export function readRequiredField(
  formData: FormData,
  field: string,
): string | null {
  const value = formData.get(field);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

export function isValidEmail(value: string | null): value is string {
  return Boolean(value && emailPattern.test(value));
}

export function meetsPasswordRequirements(
  value: string | null,
): value is string {
  return Boolean(value && passwordPattern.test(value));
}

export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://neptlium.invalid");
    return url.origin === "https://neptlium.invalid"
      ? `${url.pathname}${url.search}`
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Resolves the app's public origin for building absolute redirect URLs (e.g.
 * Supabase's emailRedirectTo). Server actions have no request URL of their
 * own, so this prefers an explicit env var and falls back to the forwarded
 * host headers set by the platform's proxy.
 */
export async function resolveOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}
