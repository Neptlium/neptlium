export default function DashboardPage() {
  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-slate-400">Institutional capital operations overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Total Assets Under Management</p>
          <p className="mt-2 text-3xl font-bold">$0.00</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Active Portfolios</p>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Treasury Accounts</p>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="font-semibold">System Status</h2>
        <p className="mt-2 text-sm text-slate-400">
          Dashboard ready. Connect to Supabase to load institutional data.
        </p>
      </div>
    </div>
  );
}
