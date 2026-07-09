import type { TreasuryAccount } from "@netlium/types";
import { requireRole } from "@/lib/auth";

// Placeholder data
const treasuryAccounts: readonly TreasuryAccount[] = [];

export default async function TreasuryPage() {
  await requireRole("operator");

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Treasury Operations</h1>
        <p className="mt-2 text-slate-400">Manage accounts, transactions, and liquidity</p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Treasury Accounts</h2>
          <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600">
            New Account
          </button>
        </div>

        {treasuryAccounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No treasury accounts configured</p>
            <p className="mt-2 text-sm text-slate-500">
              Connect to Supabase to manage institutional treasury accounts
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Account Name</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Currency</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {treasuryAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-slate-800">
                    <td className="px-4 py-2">{account.name}</td>
                    <td className="px-4 py-2">{account.accountType}</td>
                    <td className="px-4 py-2">{account.currency}</td>
                    <td className="px-4 py-2">{account.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Total Liquidity</p>
          <p className="mt-2 text-2xl font-bold">$0.00</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">YTD Transactions</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Settlement Pending</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
