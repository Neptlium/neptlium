import { requireProvisionedUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { InternalLedgerCustodyProvider } from "@netlium/lib";
import { ArrowUpRight } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
} from "@netlium/ui";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success",
  pending: "warning",
  pending_review: "warning",
  failed: "danger",
  cancelled: "neutral",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function WithdrawalsPage() {
  const { profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();

  const { data: walletRow } = await supabase
    .from("wallets")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!walletRow) {
    return (
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
            Withdrawals
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">
            Crypto withdrawals are unavailable until on-chain custody support is configured
          </p>
        </div>
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={<ArrowUpRight className="size-5" aria-hidden="true" />}
              title="Wallet not provisioned"
              description="Complete account provisioning to request withdrawals."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const provider = new InternalLedgerCustodyProvider(supabase);
  const [balances, transactions] = await Promise.all([
    provider.getBalances(walletRow.id),
    provider.listTransactions(walletRow.id),
  ]);

  const totalBalance = balances.reduce((s, b) => s + b.amount, 0);
  const withdrawals = transactions.filter((t) => t.type === "withdrawal");
  const pendingWithdrawals = withdrawals.filter(
    (t) => t.status === "pending" || t.status === "pending_review"
  );
  const completedWithdrawals = withdrawals.filter((t) => t.status === "completed");
  const totalWithdrawn = completedWithdrawals.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
          Withdrawals
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Crypto withdrawals are unavailable until on-chain custody support is configured
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={`$${fmt(totalBalance)}`} />
        <StatCard label="Total withdrawn" value={`$${fmt(totalWithdrawn)}`} />
        <StatCard label="Pending requests" value={String(pendingWithdrawals.length)} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Left: withdrawal history */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal history</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <EmptyState
                icon={<ArrowUpRight className="size-5" aria-hidden="true" />}
                title="No withdrawal requests yet"
                description="Submit a withdrawal request to move funds from your Neptlium wallet."
              />
            ) : (
              <div className="divide-y divide-border-hairline">
                {withdrawals.map((tx) => (
                  <div key={tx.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[14px] font-semibold text-text-primary">
                        −${fmt(tx.amount)} {tx.asset}
                      </p>
                      <p className="mt-0.5 text-[12px] text-text-muted">via {tx.network}</p>
                      {tx.reference && (
                        <p className="mt-0.5 font-mono text-[11px] text-text-muted">
                          {tx.reference}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[tx.status] ?? "neutral"}>
                      {tx.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: unavailable withdrawal controls */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal controls</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<ArrowUpRight className="size-5" aria-hidden="true" />}
              title="Crypto withdrawals are not currently available for this account."
              description="No on-chain custody provider or address-validation flow is configured, so withdrawal controls remain disabled."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
