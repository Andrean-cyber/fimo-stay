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
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-3"
    >
      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama kos, kota, atau alamat..."
          className="h-12 w-full rounded-[12px] border border-slate-200 bg-white py-0 pl-11 pr-10 text-sm text-slate-700 outline-none transition focus:border-fimo-navy focus:ring-2 focus:ring-fimo-navy/10 sm:h-[52px] sm:text-base"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-fimo-navy"
            aria-label="Hapus pencarian"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="h-12 shrink-0 rounded-[12px] bg-fimo-navy px-7 text-sm font-semibold text-white transition hover:bg-fimo-navy/90 active:scale-[0.98] sm:h-[52px] sm:px-10 sm:text-base"
      >
        Cari
      </button>
    </form>
  )
}