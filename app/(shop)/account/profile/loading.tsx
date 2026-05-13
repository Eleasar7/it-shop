// app/(shop)/account/profile/loading.tsx

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3 w-20 bg-slate-800/60 rounded" />
        <div className="h-8 w-52 bg-slate-800 rounded-lg" />
        <div className="h-3 w-40 bg-slate-800/40 rounded" />
      </div>
      <div className="card p-5 space-y-4">
        <div className="h-4 w-32 bg-slate-800 rounded" />
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="card p-5 space-y-4">
        <div className="h-4 w-40 bg-slate-800 rounded" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-10 bg-slate-800/60 rounded-lg" />
          <div className="h-10 bg-slate-800/60 rounded-lg" />
          <div className="h-10 bg-slate-800/60 rounded-lg sm:col-span-2" />
        </div>
        <div className="h-10 w-28 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
