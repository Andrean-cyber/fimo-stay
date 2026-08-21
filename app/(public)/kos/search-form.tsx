'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function SearchForm({ defaultQuery = '' }: { defaultQuery?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(defaultQuery)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = query.trim()
    router.push(value ? `/kos?q=${encodeURIComponent(value)}` : '/kos')
  }

  function handleClear() {
    setQuery('')
    if (pathname === '/kos') router.push('/kos')
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex h-full w-full max-w-4xl items-stretch justify-center gap-2">
      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3.5" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama kos, kota, atau alamat..." className="h-12 w-full rounded-lg border border-fimo-gray bg-white py-2.5 pl-9 pr-8 text-sm outline-none transition-colors focus:border-fimo-navy focus:ring-1 focus:ring-fimo-navy sm:h-[48px] sm:pl-10 sm:text-base" />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-fimo-navy sm:right-3" aria-label="Hapus pencarian">
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <button type="submit" className="h-12 shrink-0 rounded-lg bg-fimo-navy px-5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 active:scale-[0.98] sm:h-[48px] sm:px-8 sm:text-base">
        Cari
      </button>
    </form>
  )
}