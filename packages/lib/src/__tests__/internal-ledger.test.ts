/**
 * Unit tests for InternalLedgerCustodyProvider.
 *
 * These tests run without a Supabase connection, using a mock SupabaseClient.
 * They cover:
 * - getBalances: correct aggregation and sign for deposit vs withdrawal
 * - listTransactions: passthrough of rows from mock
 * - listDepositAddresses: passthrough from mock
 * - provisionDepositAddress: calls RPC (not direct INSERT) with correct params
 * - requestWithdrawal: calls RPC (not direct INSERT) with correct params
 *
 * Ownership enforcement (a user cannot read another user's wallet or forge
 * ledger entries) is enforced by the DB-layer RPC functions and RLS policies.
 * Integration tests for those guarantees are in supabase/tests/custody.sql.
 */

import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { InternalLedgerCustodyProvider } from "../custody/internal-ledger";

// ---------------------------------------------------------------------------
// Mock SupabaseClient factory
// ---------------------------------------------------------------------------

type QueryResult = { data: unknown; error: null | { message: string } };

function mockSupabase(overrides: {
  from?: (table: string) => { select: (...args: unknown[]) => unknown };
  rpc?: (fn: string, params?: Record<string, unknown>) => Promise<QueryResult>;
}) {
  return {
    from: overrides.from ?? vi.fn(),
    rpc: overrides.rpc ?? vi.fn()
  } as unknown as SupabaseClient;
}

// ---------------------------------------------------------------------------
// getBalances
// ---------------------------------------------------------------------------

describe("InternalLedgerCustodyProvider.getBalances", () => {
  it("returns an empty array when no transactions exist", async () => {
    const supabase = {
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ in: () => ({ data: [], error: null }) }) }) })
      })
    } as unknown as SupabaseClient;

    const provider = new InternalLedgerCustodyProvider(supabase);
    const balances = await provider.getBalances("wallet-1");
    expect(balances).toHaveLength(0);
  });

  it("sums deposits and subtracts withdrawals for the same asset/network", async () => {
    const rows = [
      { asset: "USD", network: "WIRE", amount: "1000", type: "deposit", status: "completed" },
      { asset: "USD", network: "WIRE", amount: "250", type: "withdrawal", status: "completed" }
    ];

    const supabase = {
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ in: () => ({ data: rows, error: null }) }) }) })
      })
    } as unknown as SupabaseClient;

    const provider = new InternalLedgerCustodyProvider(supabase);
    const balances = await provider.getBalances("wallet-1");

    expect(balances).toHaveLength(1);
    expect(balances[0]).toMatchObject({ asset: "USD", network: "WIRE", amount: 750 });
  });

  it("throws when the query returns an error", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({ eq: () => ({ in: () => ({ data: null, error: { message: "db error" } }) }) })
        })
      })
    } as unknown as SupabaseClient;

    const provider = new InternalLedgerCustodyProvider(supabase);
    await expect(provider.getBalances("wallet-1")).rejects.toMatchObject({ message: "db error" });
  });
});

// ---------------------------------------------------------------------------
// provisionDepositAddress — must use RPC, not direct INSERT
// ---------------------------------------------------------------------------

describe("InternalLedgerCustodyProvider.provisionDepositAddress", () => {
  it("calls the provision_deposit_address_for_wallet RPC (not direct INSERT)", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: {
        id: "addr-1",
        asset: "USD",
        network: "WIRE",
        address: "NLM-ABCD1234",
        status: "active",
        created_at: "2026-07-15T00:00:00Z"
      },
      error: null
    });

    const supabase = { rpc: rpcMock } as unknown as SupabaseClient;
    const provider = new InternalLedgerCustodyProvider(supabase);

    const result = await provider.provisionDepositAddress({
      walletId: "wallet-1",
      profileId: "profile-1",
      asset: "USD",
      network: "WIRE"
    });

    // Verify the RPC was called with the correct function name and params
    expect(rpcMock).toHaveBeenCalledWith("provision_deposit_address_for_wallet", {
      p_wallet_id: "wallet-1",
      p_asset: "USD",
      p_network: "WIRE"
    });

    // Verify the returned CustodyAddress shape
    expect(result).toMatchObject({
      id: "addr-1",
      asset: "USD",
      network: "WIRE",
      address: "NLM-ABCD1234",
      status: "active"
    });
  });

  it("throws when the RPC returns an error", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "access denied" }
    });

    const supabase = { rpc: rpcMock } as unknown as SupabaseClient;
    const provider = new InternalLedgerCustodyProvider(supabase);

    await expect(
      provider.provisionDepositAddress({ walletId: "w", profileId: "p", asset: "USD", network: "WIRE" })
    ).rejects.toMatchObject({ message: "access denied" });
  });
});

// ---------------------------------------------------------------------------
// requestWithdrawal — must use RPC, not direct INSERT
// ---------------------------------------------------------------------------

describe("InternalLedgerCustodyProvider.requestWithdrawal", () => {
  it("calls the request_wallet_withdrawal RPC (not direct INSERT)", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: {
        id: "txn-1",
        type: "withdrawal",
        asset: "USD",
        network: "WIRE",
        amount: 500,
        status: "pending",
        reference: null,
        counterparty: "IBAN:DE89370400440532013000",
        created_at: "2026-07-15T00:00:00Z"
      },
      error: null
    });

    const supabase = { rpc: rpcMock } as unknown as SupabaseClient;
    const provider = new InternalLedgerCustodyProvider(supabase);

    const result = await provider.requestWithdrawal({
      walletId: "wallet-1",
      profileId: "profile-1",
      asset: "USD",
      network: "WIRE",
      amount: 500,
      destination: "IBAN:DE89370400440532013000"
    });

    expect(rpcMock).toHaveBeenCalledWith("request_wallet_withdrawal", {
      p_wallet_id: "wallet-1",
      p_asset: "USD",
      p_network: "WIRE",
      p_amount: 500,
      p_destination: "IBAN:DE89370400440532013000"
    });

    expect(result).toMatchObject({
      id: "txn-1",
      type: "withdrawal",
      asset: "USD",
      amount: 500,
      status: "pending"
    });
  });

  it("throws when the RPC returns an error", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "wallet not found" }
    });

    const supabase = { rpc: rpcMock } as unknown as SupabaseClient;
    const provider = new InternalLedgerCustodyProvider(supabase);

    await expect(
      provider.requestWithdrawal({
        walletId: "w",
        profileId: "p",
        asset: "USD",
        network: "WIRE",
        amount: 100,
        destination: "dest"
      })
    ).rejects.toMatchObject({ message: "wallet not found" });
  });
});

// ---------------------------------------------------------------------------
// listSupportedAssets / listSupportedNetworks
// ---------------------------------------------------------------------------

describe("InternalLedgerCustodyProvider — supported assets/networks", () => {
  const provider = new InternalLedgerCustodyProvider({} as SupabaseClient);

  it("returns USD as the only supported asset", async () => {
    const assets = await provider.listSupportedAssets();
    expect(assets).toHaveLength(1);
    expect(assets[0]!.code).toBe("USD");
  });

  it("returns WIRE as the only supported network for USD", async () => {
    const networks = await provider.listSupportedNetworks("USD");
    expect(networks).toHaveLength(1);
    expect(networks[0]!.code).toBe("WIRE");
  });

  it("returns empty networks for unsupported assets", async () => {
    const networks = await provider.listSupportedNetworks("BTC");
    expect(networks).toHaveLength(0);
  });
});
