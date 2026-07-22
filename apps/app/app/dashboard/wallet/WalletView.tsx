"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
} from "@netlium/ui";
import { DepositPanel } from "./CryptoDepositFlow";

interface AssetNetworkPair {
  assetCode: string;
  assetLabel: string;
  networkCode: string;
  networkLabel: string;
}

interface Transaction {
  id: string;
  type: string;
  asset: string;
  network: string;
  amount: number;
  status: string;
  created_at: string;
}

interface ExistingAddress {
  id: string;
  asset: string;
  network: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface WalletViewProps {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  pendingCount: number;
  existingAddresses: ExistingAddress[];
  transactions: Transaction[];
  pairs: AssetNetworkPair[];
  hasWallet: boolean;
  walletId: string | null;
}

type TabId = "Overview" | "Deposit" | "Withdraw" | "History";

const TABS: TabId[] = ["Overview", "Deposit", "Withdraw", "History"];

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TX_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success",
  pending: "warning",
  pending_review: "warning",
  failed: "danger",
  cancelled: "neutral",
};

type HistoryFilter = "All" | "Deposits" | "Withdrawals" | "Transfers";

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<HistoryFilter>("All");

  const filters: HistoryFilter[] = ["All", "Deposits", "Withdrawals", "Transfers"];

  const filtered = transactions.filter((tx) => {
    if (filter === "All") return true;
    if (filter === "Deposits") return tx.type === "deposit";
    if (filter === "Withdrawals") return tx.type === "withdrawal";
    if (filter === "Transfers") return tx.type === "transfer";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              filter === f
                ? "bg-accent-primary/12 text-accent-primary"
                : "bg-surface-3 text-text-muted hover:text-text-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="size-5" aria-hidden="true" />}
          title="No transactions"
          description={
            filter === "All"
              ? "Your transaction history will appear here."
              : `No ${filter.toLowerCase()} found.`
          }
        />
      ) : (
        <div className="divide-y divide-border-hairline">
          {filtered.map((tx) => {
            const isDeposit = tx.type === "deposit";
            return (
              <div key={tx.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isDeposit ? "bg-success/12" : "bg-surface-3"
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft className="size-4 text-success" />
                    ) : (
                      <ArrowUpRight className="size-4 text-text-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-text-primary capitalize">
                      {tx.type}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {tx.asset} · {tx.network} ·{" "}
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-[13px] font-semibold ${
                      isDeposit ? "text-success" : "text-text-primary"
                    }`}
                  >
                    {isDeposit ? "+" : "-"}
                    {fmt(tx.amount)}
                  </span>
                  <Badge tone={TX_STATUS_TONE[tx.status] ?? "neutral"}>
                    {tx.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2 text-right">
        <a
          href="/dashboard/transactions"
          className="text-[13px] font-medium text-accent-primary hover:underline"
        >
          View all transactions →
        </a>
      </div>
    </div>
  );
}

// ─── Main WalletView ──────────────────────────────────────────────────────────
export function WalletView({
  totalBalance,
  availableBalance,
  pendingBalance,
  pendingCount,
  existingAddresses,
  transactions,
  hasWallet,
  walletId,
}: WalletViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("Overview");

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
          Neptlium Wallet
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Crypto balances, funding destinations, withdrawals, and transaction history
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total balance" value={`$${fmt(totalBalance)}`} />
        <StatCard label="Available" value={`$${fmt(availableBalance)}`} />
        {pendingCount > 0 ? (
          <StatCard
            label="Pending"
            value={`$${fmt(pendingBalance)}`}
            delta={`${pendingCount} transaction${pendingCount === 1 ? "" : "s"} pending`}
          />
        ) : (
          <StatCard label="Pending" value={`$${fmt(pendingBalance)}`} />
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border-hairline">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === tab
                ? "-mb-px border-b-2 border-accent-primary text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            {!hasWallet ? (
              <Card>
                <CardContent className="py-10">
                  <EmptyState
                    icon={<Wallet className="size-5" aria-hidden="true" />}
                    title="Wallet not provisioned"
                    description="Complete account provisioning to activate your Neptlium wallet."
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Funding references */}
                <Card>
                  <CardHeader>
                    <CardTitle>Funding references</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {existingAddresses.length === 0 ? (
                      <EmptyState
                        icon={<Wallet className="size-5" aria-hidden="true" />}
                        title="No crypto destinations"
                        description="Crypto deposits are not currently available for this account."
                      />
                    ) : (
                      <div className="divide-y divide-border-hairline">
                        {existingAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="flex items-center justify-between py-3"
                          >
                            <div>
                              <p className="text-[13px] font-medium text-text-primary">
                                {addr.asset}
                              </p>
                              <p className="font-mono text-[11px] text-text-muted">{addr.address}</p>
                              <p className="text-[11px] text-text-muted">{addr.network}</p>
                            </div>
                            <Badge tone={addr.status === "active" ? "success" : "neutral"}>
                              {addr.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick actions */}
                <div>
                  <p className="mb-3 text-[13px] font-semibold text-text-primary">Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("Deposit")}
                    >
                      Deposit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("Withdraw")}
                    >
                      Withdraw
                    </Button>
                    <Button variant="outline" size="sm" href="/dashboard/transactions">
                      View transactions
                    </Button>
                    <Button variant="outline" size="sm" href="/dashboard/allocations">
                      Allocate capital
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Deposit */}
        {activeTab === "Deposit" && (
          <div className="space-y-4">
            <DepositPanel existingAddresses={existingAddresses} walletId={walletId} />
          </div>
        )}

        {/* Withdraw */}
        {activeTab === "Withdraw" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-10">
                <EmptyState
                  icon={<ArrowUpRight className="size-5" aria-hidden="true" />}
                  title="Crypto withdrawals are not currently available for this account."
                  description="No on-chain custody provider or address-validation flow is configured, so withdrawal controls remain disabled."
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* History */}
        {activeTab === "History" && <HistoryTab transactions={transactions} />}
      </div>
    </div>
  );
}
