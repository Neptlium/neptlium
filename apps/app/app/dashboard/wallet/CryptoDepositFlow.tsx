"use client";

import { useState } from "react";
import { ArrowDownLeft, CheckCircle2, Copy } from "lucide-react";
import { Badge, Card, CardContent, EmptyState } from "@netlium/ui";

export interface DepositAddress {
  id: string;
  asset: string;
  network: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface DepositPanelProps {
  existingAddresses: DepositAddress[];
  walletId: string | null;
}

function AddressCard({ addr }: { addr: DepositAddress }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(addr.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-border-default bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[13px] font-medium text-text-primary">{addr.asset}</span>
          <span className="text-[12px] text-text-muted">·</span>
          <span className="truncate text-[12px] text-text-muted">{addr.network}</span>
        </div>
        <Badge tone={addr.status === "active" ? "success" : "neutral"}>{addr.status}</Badge>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-1 px-3 py-2">
        <span className="min-w-0 flex-1 break-all font-mono text-[12px] text-text-primary">{addr.address}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-sm bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {copied ? <><CheckCircle2 className="size-3 text-success" /> Copied</> : <><Copy className="size-3" /> Copy</>}
        </button>
      </div>
      <p className="text-[11px] text-text-muted">Use only the listed asset and network for this backend-issued destination.</p>
    </div>
  );
}

export function DepositPanel({ existingAddresses }: DepositPanelProps) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] font-semibold text-text-primary">Crypto deposits</p>
      {existingAddresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {existingAddresses.map((addr) => <AddressCard key={addr.id} addr={addr} />)}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={<ArrowDownLeft className="size-5" aria-hidden="true" />}
              title="Crypto deposits are not currently available for this account."
              description="No backend-issued crypto destination exists for this wallet. A real custody provider is required before address issuance or confirmation tracking can be enabled."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { DepositPanel as CryptoDepositFlow };
