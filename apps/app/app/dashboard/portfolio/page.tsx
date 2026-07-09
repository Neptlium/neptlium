import type { Portfolio } from "@netlium/types";

// Placeholder data
const portfolios: readonly Portfolio[] = [];

export default function PortfolioPage() {
  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Portfolio Management</h1>
        <p className="mt-2 text-slate-400">View holdings, allocation, and performance</p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Investment Portfolios</h2>
          <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600">
            New Portfolio
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No portfolios created</p>
            <p className="mt-2 text-sm text-slate-500">
              Connect to Supabase to create and manage investment portfolios
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{portfolio.name}</h3>
                    <p className="text-sm text-slate-400">{portfolio.currency}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{portfolio.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Total Portfolio Value</p>
          <p className="mt-2 text-2xl font-bold">$0.00</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">YTD Return</p>
          <p className="mt-2 text-2xl font-bold">0.00%</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Active Holdings</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
