// app/(admin)/admin/loading.tsx

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-slate-800 rounded-lg" />
        <div className="h-4 w-28 bg-slate-800/60 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-slate-700 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-700" />
            </div>
            <div className="h-7 w-20 bg-slate-700 rounded-lg" />
            <div className="h-3 w-16 bg-slate-700/60 rounded" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card h-72" />
        <div className="card h-72" />
      </div>
    </div>
  );
}
