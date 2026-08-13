export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Search bar skeleton */}
      <div className="skeleton mb-6 h-12 w-full max-w-lg rounded-xl" />

      {/* Info text skeleton */}
      <div className="skeleton mb-4 h-4 w-28 rounded-full" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-fimo-gray bg-white"
          >
            <div className="skeleton aspect-[4/3]" />

            <div className="space-y-3 p-4">
              <div className="skeleton h-4 rounded-full" style={{ width: `${65 + (i % 3) * 10}%` }} />

              <div className="flex items-center gap-1.5">
                <div className="skeleton h-3.5 w-3.5 shrink-0 rounded-full" />
                <div className="skeleton h-3 w-16 rounded-full" />
              </div>

              <div className="skeleton h-5 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}