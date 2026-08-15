'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

export function FilterPanel({
  q,
  kategori,
  priceMin,
  priceMax,
  activeFilterCount,
  kosTypes,
}: {
  q: string
  kategori: string
  priceMin: string
  priceMax: string
  activeFilterCount: number
  kosTypes: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(false)

  const KATEGORI_OPTIONS = [
    { value: '', label: 'Semua Jenis' },
    ...kosTypes.map((kt) => ({ value: kt.id, label: kt.name })),
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
          activeFilterCount > 0
            ? 'border-fimo-navy bg-fimo-navy/5 text-fimo-navy'
            : 'border-fimo-gray text-gray-600 hover:bg-fimo-gray/40'
        }`}
        aria-expanded={open}
        aria-label="Filter pencarian"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-fimo-navy text-[10px] font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* backdrop untuk klik-luar-tutup, khusus mobile */}
          <div
            className="fixed inset-0 z-10 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-20 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-fimo-gray bg-white p-4 shadow-lg sm:w-80">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Filter Pencarian</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Tutup filter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action="/kos" method="GET" className="space-y-3">
              <input type="hidden" name="q" value={q} />

              <div className="flex flex-col gap-1">
                <label htmlFor="kategori" className="text-xs font-medium text-gray-500">
                  Jenis Kos
                </label>
                <select
                  id="kategori"
                  name="kategori"
                  defaultValue={kategori}
                  className="rounded-lg border border-fimo-gray px-3 py-2 text-sm text-gray-700 outline-none focus:border-fimo-blue"
                >
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="priceMin" className="text-xs font-medium text-gray-500">
                    Harga Min
                  </label>
                  <input
                    id="priceMin"
                    name="priceMin"
                    type="number"
                    min={0}
                    step={50000}
                    defaultValue={priceMin}
                    placeholder="Rp0"
                    className="w-full rounded-lg border border-fimo-gray px-3 py-2 text-sm text-gray-700 outline-none focus:border-fimo-blue"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="priceMax" className="text-xs font-medium text-gray-500">
                    Harga Maks
                  </label>
                  <input
                    id="priceMax"
                    name="priceMax"
                    type="number"
                    min={0}
                    step={50000}
                    defaultValue={priceMax}
                    placeholder="Tanpa batas"
                    className="w-full rounded-lg border border-fimo-gray px-3 py-2 text-sm text-gray-700 outline-none focus:border-fimo-blue"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-fimo-navy px-4 py-2 text-sm font-medium text-white hover:bg-fimo-navy/90"
                >
                  Terapkan Filter
                </button>
                {activeFilterCount > 0 && (
                  <a
                    href={q ? `/kos?q=${encodeURIComponent(q)}` : '/kos'}
                    className="rounded-lg border border-fimo-gray px-4 py-2 text-sm font-medium text-gray-500 hover:bg-fimo-gray/40"
                  >
                    Reset
                  </a>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
