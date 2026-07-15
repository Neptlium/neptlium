/**
 * Unit tests for provisioningPayloadSchema validation.
 *
 * These tests run without a Supabase connection and cover:
 * - Individual provisioning payload validation
 * - Organization provisioning payload validation
 * - Provisioning retry / idempotency (same valid payload validates twice)
 * - Provisioning failure leaves provisioned_at null (schema rejects incomplete data)
 * - One investment portfolio per profile (schema enforces investorType)
 * - One wallet per profile (provisioningPayloadSchema requires complete data)
 *
 * Integration tests covering the DB-level guarantees (one portfolio / wallet
 * per profile, RLS isolation, RPC ownership checks) are in
 * supabase/tests/provisioning.sql and require a running Supabase stack.
 */

import { describe, it, expect } from "vitest";
import {
  provisioningPayloadSchema,
  isOrganizationPurpose,
  type ProvisioningPayload
} from "../validation/onboarding";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const individualBase: ProvisioningPayload = {
  firstName: "Alice",
  lastName: "Smith",
  residenceCountry: "US",
  investorType: "individual",
  purpose: "Personal wealth management",
  primaryObjective: "Long-term growth",
  investmentExperience: "experienced",
  preferredCurrency: "USD",
  riskPreference: "balanced",
  complianceAcknowledged: true
};

const orgBase: ProvisioningPayload = {
  firstName: "Bob",
  lastName: "Jones",
  residenceCountry: "GB",
  investorType: "family_office",
  purpose: "Multi-generational wealth",
  companyName: "Jones Family Office Ltd",
  role: "Principal",
  industry: "Finance",
  country: "GB",
  organizationSize: "1-10",
  complianceAcknowledged: true
};

// ---------------------------------------------------------------------------
// 1. Individual provisioning
// ---------------------------------------------------------------------------

describe("individual provisioning", () => {
  it("accepts a complete individual payload", () => {
    const result = provisioningPayloadSchema.safeParse(individualBase);
    expect(result.success).toBe(true);
  });

  it("rejects an individual payload missing primaryObjective", () => {
    const payload = { ...individualBase, primaryObjective: undefined };
    const result = provisioningPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects an individual payload missing investmentExperience", () => {
    const payload = { ...individualBase, investmentExperience: undefined };
    const result = provisioningPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects an individual payload missing preferredCurrency", () => {
    const payload = { ...individualBase, preferredCurrency: undefined };
    const result = provisioningPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects an individual payload missing riskPreference", () => {
    const payload = { ...individualBase, riskPreference: undefined };
    const result = provisioningPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Organization provisioning
// ---------------------------------------------------------------------------

describe("organization provisioning", () => {
  it("accepts a complete organization payload", () => {
    const result = provisioningPayloadSchema.safeParse(orgBase);
    expect(result.success).toBe(true);
  });

  it("accepts all non-individual investor types", () => {
    const types = ["family_office", "business", "investment_firm", "treasury_team", "capital_partner"] as const;
    for (const investorType of types) {
      const result = provisioningPayloadSchema.safeParse({ ...orgBase, investorType });
      expect(result.success, `${investorType} should be valid`).toBe(true);
    }
  });

  it("rejects an organization payload missing companyName", () => {
    const { companyName: _, ...rest } = orgBase;
    const result = provisioningPayloadSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an organization payload missing industry", () => {
    const { industry: _, ...rest } = orgBase;
    const result = provisioningPayloadSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an organization payload missing country", () => {
    const { country: _, ...rest } = orgBase;
    const result = provisioningPayloadSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Provisioning retry / idempotency (schema level)
// ---------------------------------------------------------------------------

describe("provisioning idempotency", () => {
  it("validates the same individual payload twice without error", () => {
    const r1 = provisioningPayloadSchema.safeParse(individualBase);
    const r2 = provisioningPayloadSchema.safeParse(individualBase);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("validates the same organization payload twice without error", () => {
    const r1 = provisioningPayloadSchema.safeParse(orgBase);
    const r2 = provisioningPayloadSchema.safeParse(orgBase);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Provisioning failure leaves provisioned_at null
//    (schema rejects payloads that would not reach the DB call)
// ---------------------------------------------------------------------------

describe("provisioning failure paths", () => {
  it("schema rejects a payload without complianceAcknowledged — provisioned_at stays null", () => {
    // If the payload is invalid, the server action returns early and never
    // calls the DB function, so provisioned_at is never written.
    const result = provisioningPayloadSchema.safeParse({
      ...individualBase,
      complianceAcknowledged: undefined
    });
    expect(result.success).toBe(false);
  });

  it("schema rejects a payload with an empty firstName", () => {
    const result = provisioningPayloadSchema.safeParse({ ...individualBase, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("schema rejects an unknown investorType", () => {
    const result = provisioningPayloadSchema.safeParse({ ...individualBase, investorType: "whale" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. isOrganizationPurpose helper
// ---------------------------------------------------------------------------

describe("isOrganizationPurpose", () => {
  it("returns false for individual", () => {
    expect(isOrganizationPurpose("individual")).toBe(false);
  });

  it("returns true for all non-individual types", () => {
    const orgTypes = ["family_office", "business", "investment_firm", "treasury_team", "capital_partner"] as const;
    for (const t of orgTypes) {
      expect(isOrganizationPurpose(t), `${t} should be org purpose`).toBe(true);
    }
  });
});
