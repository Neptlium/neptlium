export default function DocumentsPage() {
  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
        <p className="mt-2 text-slate-400">Institutional document repository</p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="text-center py-12">
          <p className="text-slate-400">No documents uploaded</p>
          <p className="mt-2 text-sm text-slate-500">
            Connect to Supabase to manage institutional documents
          </p>
        </div>
      </div>
    </div>
  );
}
