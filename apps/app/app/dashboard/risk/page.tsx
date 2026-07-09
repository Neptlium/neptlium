import { requireRole } from "@/lib/auth";

export default async function RiskPage() {
  await requireRole("manager");

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Risk Monitoring</h1>
        <p className="mt-2 text-slate-400">Track exposure, limits, and institutional risk metrics</p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="text-center py-12">
          <p className="text-slate-400">No risk data available</p>
          <p className="mt-2 text-sm text-slate-500">
            Connect to Supabase to monitor risk exposure
          </p>
        </div>
      </div>
    </div>
  );
}
