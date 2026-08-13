'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export function SearchForm({ defaultQuery = '' }: { defaultQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/kos?q=${encodeURIComponent(query)}`)
  }

  function handleClear() {
    setQuery('')
    router.push('/kos')
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama kos, kota, atau alamat..."
          className="w-full rounded-lg border border-fimo-gray bg-white p-3 pl-10 pr-9 text-sm outline-none transition-colors focus:border-fimo-navy focus:ring-1 focus:ring-fimo-navy"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fimo-navy"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="rounded-lg bg-fimo-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90"
      >
        Cari
      </button>
    </form>
  )
}