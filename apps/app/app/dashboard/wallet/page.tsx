import { Wallet as WalletIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, EmptyState, StatCard } from "@netlium/ui";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { InternalLedgerCustodyProvider } from "@netlium/lib";
import { requireProvisionedUser } from "@/lib/auth";
import { DepositAddressList } from "./DepositAddressList";
import { GenerateAddressButton, type AssetNetworkPair } from "./GenerateAddressButton";
import { WithdrawalForm } from "./WithdrawalForm";
import { TransactionList } from "./TransactionList";

export default async function WalletPage() {
  const { profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();

  const { data: wallet } = await supabase.from("wallets").select("id").eq("profile_id", profile.id).maybeSingle();

  if (!wallet) {
    return (
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-h1 font-semibold tracking-tight text-text-primary">Neptlium Wallet</h1>
        </div>
        <Card>
          <EmptyState
            icon={<WalletIcon className="size-5" aria-hidden="true" />}
            title="Wallet not yet provisioned"
            description="Complete account provisioning to activate your wallet."
          />
        </Card>
      </div>
    );
  }

  const provider = new InternalLedgerCustodyProvider(supabase);
  const [balances, addresses, transactions, assets] = await Promise.all([
    provider.getBalances(wallet.id),
    provider.listDepositAddresses(wallet.id),
    provider.listTransactions(wallet.id),
    provider.listSupportedAssets()
  ]);

  const pairs: readonly AssetNetworkPair[] = (
    await Promise.all(
      assets.map(async (asset) => {
        const networks = await provider.listSupportedNetworks(asset.code);
        return networks.map((network) => ({
          assetCode: asset.code,
          assetLabel: asset.label,
          networkCode: network.code,
          networkLabel: network.label
        }));
      })
    )
  ).flat();

  const cashBalance = balances.find((balance) => balance.asset === "USD")?.amount ?? 0;
  const pendingCount = transactions.filter((transaction) => transaction.status === "pending").length;

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-h1 font-semibold tracking-tight text-text-primary">Neptlium Wallet</h1>
        <p className="mt-2 text-body text-text-secondary">
          Institutional custody infrastructure for funding, transfers, and withdrawals
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Cash balance" value={`$${cashBalance.toFixed(2)}`} />
        <StatCard label="Pending transactions" value={String(pendingCount)} />
        <StatCard label="Deposit references" value={String(addresses.length)} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Deposit references</CardTitle>
          <GenerateAddressButton pairs={pairs} />
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <EmptyState
              icon={<WalletIcon className="size-5" aria-hidden="true" />}
              title="No deposit references yet"
              description="Generate one to fund your wallet via wire transfer."
            />
          ) : (
            <DepositAddressList addresses={addresses} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <WithdrawalForm pairs={pairs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState title="No wallet transactions yet" />
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
