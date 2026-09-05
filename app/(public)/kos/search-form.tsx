'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { KosSuggestion } from '@/app/api/kos/autocomplete/route'

const DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2

export function SearchForm({ defaultQuery = '' }: { defaultQuery?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(defaultQuery)
  const [suggestions, setSuggestions] = useState<KosSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // dipakai untuk buang response fetch yang sudah usang (user keburu ngetik lagi)
  const latestQueryRef = useRef('')

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceTimer.current = setTimeout(async () => {
      latestQueryRef.current = trimmed
      try {
        const res = await fetch(`/api/kos/autocomplete?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) return
        const data: { suggestions: KosSuggestion[] } = await res.json()

        // kalau user sudah ngetik lagi sebelum response ini balik, abaikan
        if (latestQueryRef.current !== trimmed) return

        setSuggestions(data.suggestions)
        setOpen(data.suggestions.length > 0)
        setActiveIndex(-1)
      } catch {
        // gagal fetch saran bukan hal fatal — user masih bisa submit manual
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goToListing(value: string) {
    setOpen(false)
    router.push(value ? `/kos?q=${encodeURIComponent(value)}` : '/kos')
  }

  function goToDetail(slug: string) {
    setOpen(false)
    router.push(`/kos/${slug}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    goToListing(query.trim())
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    if (pathname === '/kos') router.push('/kos')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      goToDetail(suggestions[activeIndex].slug)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Cari nama kos, kota, atau alamat..."
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            autoComplete="off"
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

          {open && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-[12px] border border-slate-200 bg-white py-1.5 shadow-lg">
              {suggestions.map((s, i) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToDetail(s.slug)}
                    className={`flex w-full flex-col items-start px-4 py-2 text-left text-sm transition ${
                      i === activeIndex ? 'bg-fimo-navy/5 text-fimo-navy' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-slate-400">
                      {s.district ? `${s.district}, ${s.city}` : s.city}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="h-12 shrink-0 rounded-[12px] bg-fimo-navy px-7 text-sm font-semibold text-white transition hover:bg-fimo-navy/90 active:scale-[0.98] sm:h-[52px] sm:px-10 sm:text-base"
        >
          Cari
        </button>
      </form>
    </div>
  )
}
