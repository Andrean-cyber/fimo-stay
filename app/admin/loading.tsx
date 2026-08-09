export default function AdminLoading() {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-fimo-gray" />
        <div className="h-4 w-72 rounded bg-fimo-gray" />
        <div className="rounded-2xl border border-fimo-gray bg-white p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-fimo-gray/60" />
          ))}
        </div>
      </div>
    )
  }