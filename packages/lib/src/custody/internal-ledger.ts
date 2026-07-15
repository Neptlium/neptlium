import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CustodyAddress,
  CustodyAsset,
  CustodyBalance,
  CustodyNetwork,
  CustodyProvider,
  CustodyTransaction,
  ProvisionDepositAddressParams,
  RequestWithdrawalParams
} from "./types";

interface WalletTransactionRow {
  readonly id: string;
  readonly type: CustodyTransaction["type"];
  readonly asset: string;
  readonly network: string;
  readonly amount: number | string;
  readonly status: CustodyTransaction["status"];
  readonly reference: string | null;
  readonly counterparty: string | null;
  readonly created_at: string;
}

interface CustodyAddressRow {
  readonly id: string;
  readonly asset: string;
  readonly network: string;
  readonly address: string;
  readonly status: CustodyAddress["status"];
  readonly created_at: string;
}

function toTransaction(row: WalletTransactionRow): CustodyTransaction {
  return {
    id: row.id,
    type: row.type,
    asset: row.asset,
    network: row.network,
    amount: Number(row.amount),
    status: row.status,
    reference: row.reference,
    counterparty: row.counterparty,
    createdAt: row.created_at
  };
}

function toAddress(row: CustodyAddressRow): CustodyAddress {
  return {
    id: row.id,
    asset: row.asset,
    network: row.network,
    address: row.address,
    status: row.status,
    createdAt: row.created_at
  };
}

/**
 * The only CustodyProvider implementation today. It is a real, persisted
 * ledger every balance is derived from committed rows in
 * wallet_transactions, never hardcoded but it has no connection to any
 * actual payment rail or blockchain. Deposit addresses are internal wire
 * funding references (e.g. NLM-7F3A9C2E), not blockchain addresses; funding
 * and withdrawals are recorded as pending and must be reconciled by
 * operations staff against the institution's actual bank activity today.
 * That reconciliation step is exactly what a future real custody/payments
 * integration would automate this class is what gets replaced then.
 */
export class InternalLedgerCustodyProvider implements CustodyProvider {
  readonly id = "internal";

  constructor(private readonly supabase: SupabaseClient) {}

  async listSupportedAssets(): Promise<readonly CustodyAsset[]> {
    return [{ code: "USD", label: "US Dollar" }];
  }

  async listSupportedNetworks(asset: string): Promise<readonly CustodyNetwork[]> {
    if (asset !== "USD") return [];
    return [{ code: "WIRE", label: "Domestic Wire" }];
  }

  async getBalances(walletId: string): Promise<readonly CustodyBalance[]> {
    const { data, error } = await this.supabase
      .from("wallet_transactions")
      .select("asset, network, amount, type, status")
      .eq("wallet_id", walletId)
      .eq("status", "completed")
      .in("type", ["deposit", "withdrawal"]);

    if (error) throw error;

    const totals = new Map<string, CustodyBalance>();
    for (const row of (data ?? []) as WalletTransactionRow[]) {
      const key = row.asset + "::" + row.network;
      const sign = row.type === "withdrawal" ? -1 : 1;
      const existing = totals.get(key);
      totals.set(key, {
        asset: row.asset,
        network: row.network,
        amount: (existing?.amount ?? 0) + sign * Number(row.amount)
      });
    }

    return [...totals.values()];
  }

  async listTransactions(walletId: string): Promise<readonly CustodyTransaction[]> {
    const { data, error } = await this.supabase
      .from("wallet_transactions")
      .select("id, type, asset, network, amount, status, reference, counterparty, created_at")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as WalletTransactionRow[]).map(toTransaction);
  }

  async listDepositAddresses(walletId: string): Promise<readonly CustodyAddress[]> {
    const { data, error } = await this.supabase
      .from("custody_addresses")
      .select("id, asset, network, address, status, created_at")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as CustodyAddressRow[]).map(toAddress);
  }

  async provisionDepositAddress(params: ProvisionDepositAddressParams): Promise<CustodyAddress> {
    // Insert is mediated by the provision_deposit_address_for_wallet SECURITY
    // DEFINER function, which validates wallet ownership server-side. Direct
    // INSERT into custody_addresses is no longer permitted via RLS.
    const { data, error } = await this.supabase.rpc("provision_deposit_address_for_wallet", {
      p_wallet_id: params.walletId,
      p_asset: params.asset,
      p_network: params.network
    });

    if (error) throw error;

    return toAddress(data as CustodyAddressRow);
  }

  async requestWithdrawal(params: RequestWithdrawalParams): Promise<CustodyTransaction> {
    // Insert is mediated by the request_wallet_withdrawal SECURITY DEFINER
    // function, which validates wallet ownership server-side. Direct INSERT
    // into wallet_transactions is no longer permitted via RLS.
    const { data, error } = await this.supabase.rpc("request_wallet_withdrawal", {
      p_wallet_id: params.walletId,
      p_asset: params.asset,
      p_network: params.network,
      p_amount: params.amount,
      p_destination: params.destination
    });

    if (error) throw error;

    return toTransaction(data as WalletTransactionRow);
  }
}
