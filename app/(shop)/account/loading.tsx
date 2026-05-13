// app/(shop)/account/loading.tsx

export default function AccountLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Hero card skeleton */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-800 rounded-lg" />
            <div className="h-3 w-52 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1.5">
              <div className="h-6 w-16 bg-slate-800 rounded mx-auto" />
              <div className="h-3 w-20 bg-slate-800/60 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick links skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 flex flex-col items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800" />
            <div className="h-3 w-16 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Orders skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 bg-slate-800 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-800/60 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
