export default function ProductsLoading() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="section py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-2">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-3.5 w-24" />
          </div>
          <div className="skeleton h-9 w-36 rounded-md" />
        </div>
        <div className="flex gap-6">
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white border border-[#e8eaed] rounded-lg p-4 space-y-4">
              {[80, 120, 90, 60].map((h, i) => (
                <div key={i} className="skeleton rounded" style={{ height: h }} />
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e8eaed] rounded-lg overflow-hidden">
                <div className="skeleton aspect-square" style={{ borderRadius: 0 }} />
                <div className="p-3 space-y-2.5">
                  <div className="skeleton h-2.5 w-12 rounded-full" />
                  <div className="skeleton h-3.5 w-full" />
                  <div className="skeleton h-3.5 w-3/4" />
                  <div className="skeleton h-5 w-20" />
                  <div className="skeleton h-8 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
