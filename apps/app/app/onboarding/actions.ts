"use server";

import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { isOrganizationPurpose, provisioningPayloadSchema, type ProvisioningPayload } from "@netlium/lib";
import { requireUser } from "@/lib/auth";

export type ProvisioningResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

/**
 * Finalizes account opening by calling the provision_account() database
 * function, which wraps all provisioning steps (role assignment, organization
 * creation, portfolio creation, wallet creation, profile update) in a single
 * database transaction. provisioned_at is written last by the DB function, so
 * any failure before that point leaves it NULL and the account in a safely
 * retryable "not yet provisioned" state.
 *
 * The function is SECURITY DEFINER and verifies auth.uid() server-side, so
 * the user can only provision their own account.
 */
export async function submitProvisioning(input: ProvisioningPayload): Promise<ProvisioningResult> {
  await requireUser();

  const parsed = provisioningPayloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some information from a previous step is missing or invalid." };
  }

  const data = parsed.data;
  const supabase = await createSupabaseServerClient();
  const isOrg = isOrganizationPurpose(data.investorType);

  const { error } = await supabase.rpc("provision_account", {
    p_investor_type: data.investorType,
    p_purpose: data.purpose,
    p_first_name: data.firstName,
    p_last_name: data.lastName,
    p_residence_country: data.residenceCountry,
    p_compliance_acknowledged_at: new Date().toISOString(),

    // Individual-only fields
    p_primary_objective: data.primaryObjective ?? null,
    p_investment_experience: data.investmentExperience ?? null,
    p_preferred_currency: data.preferredCurrency ?? null,
    p_risk_preference: data.riskPreference ?? null,

    // Organization fields — only populated for non-individual types
    p_org_name: isOrg ? (data.companyName ?? null) : null,
    p_org_role: isOrg ? (data.role ?? null) : null,
    p_org_website: isOrg ? (data.website || null) : null,
    p_org_industry: isOrg ? (data.industry ?? null) : null,
    p_org_country: isOrg ? (data.country ?? null) : null,
    p_org_size: isOrg ? (data.organizationSize ?? null) : null,
    p_aum_range: isOrg ? (data.aumRange || null) : null
  });

  if (error) {
    return { ok: false, error: "Unable to finalize your account. Please try again." };
  }

  return { ok: true };
}
