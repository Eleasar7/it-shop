// app/(shop)/loading.tsx

export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-slate-950 px-4 sm:px-6 lg:px-8 py-20 lg:py-32 max-w-7xl mx-auto">
        <div className="h-5 w-52 bg-slate-800 rounded-full mb-6" />
        <div className="h-14 w-3/4 bg-slate-800 rounded-xl mb-4" />
        <div className="h-14 w-1/2 bg-slate-800/60 rounded-xl mb-6" />
        <div className="h-5 w-2/3 bg-slate-800/40 rounded mb-2" />
        <div className="h-5 w-1/2 bg-slate-800/30 rounded mb-10" />
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-slate-700 rounded-xl" />
          <div className="h-12 w-36 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Trust Badges Skeleton */}
      <div className="border-y border-slate-800/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kategorien Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-40 bg-slate-800 rounded-lg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-800/40 border border-slate-700/40" />
          ))}
        </div>
      </div>

      {/* Produkte Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="h-8 w-48 bg-slate-800 rounded-lg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-800/40 border border-slate-700/40 overflow-hidden">
              <div className="aspect-square bg-slate-800/60" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 w-16 bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-700 rounded" />
                <div className="h-4 w-3/4 bg-slate-700/60 rounded" />
                <div className="flex justify-between items-end mt-3">
                  <div className="h-6 w-24 bg-slate-700 rounded" />
                  <div className="h-9 w-9 bg-slate-700 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
