import { requireProvisionedUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { InternalLedgerCustodyProvider } from "@netlium/lib";
import { DepositPanel } from "../wallet/CryptoDepositFlow";
import Link from "next/link";

export default async function DepositPage() {
  const { profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();

  const { data: walletRow } = await supabase
    .from("wallets")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const existingAddresses: Array<{
    id: string;
    asset: string;
    network: string;
    address: string;
    status: string;
    createdAt: string;
  }> = [];

  let walletId: string | null = null;
  let depositCount = 0;

  if (walletRow) {
    walletId = walletRow.id;
    const provider = new InternalLedgerCustodyProvider(supabase);
    const [addresses, transactions] = await Promise.all([
      provider.listDepositAddresses(walletRow.id),
      provider.listTransactions(walletRow.id),
    ]);

    for (const a of addresses) {
      existingAddresses.push({
        id: a.id,
        asset: a.asset,
        network: a.network,
        address: a.address,
        status: a.status,
        createdAt: a.createdAt,
      });
    }

    depositCount = transactions.filter((t) => t.type === "deposit").length;
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
          Crypto Deposits
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Crypto deposits are unavailable until a real custody provider is configured
        </p>
      </div>

      <DepositPanel existingAddresses={existingAddresses} walletId={walletId} />

      <div className="rounded-md border border-border-default bg-surface-1 px-4 py-4 space-y-1.5">
        <p className="text-[13px] font-semibold text-text-primary">Deposit activity</p>
        {depositCount === 0 ? (
          <p className="text-[12px] text-text-muted">No deposits recorded yet.</p>
        ) : (
          <p className="text-[12px] text-text-muted">
            {depositCount} deposit transaction{depositCount === 1 ? "" : "s"} on record.
          </p>
        )}
        <Link
          href="/dashboard/transactions"
          className="block text-[13px] font-medium text-accent-primary hover:underline"
        >
          View all transactions →
        </Link>
      </div>
    </div>
  );
}
