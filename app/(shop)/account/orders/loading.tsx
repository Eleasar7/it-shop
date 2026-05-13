// app/(shop)/account/orders/loading.tsx

export default function OrdersLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-3 w-16 bg-slate-800/60 rounded" />
        <div className="h-8 w-56 bg-slate-800 rounded-lg" />
        <div className="h-3 w-32 bg-slate-800/60 rounded" />
      </div>
      <div className="card overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-700/30 last:border-0"
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-28 bg-slate-800 rounded" />
                <div className="h-4 w-16 bg-slate-800/60 rounded-full" />
              </div>
              <div className="h-3 w-40 bg-slate-800/40 rounded" />
            </div>
            <div className="h-5 w-20 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
