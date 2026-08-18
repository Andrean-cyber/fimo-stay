'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { saveRecommendations } from '../../actions'

type KosOption = {
  id: string
  name: string
  city: string
  address: string
  priceMonthly: number
  roomType: string | null
  facilities: string[]
  matchScore: number
  matchReasons: string[]
}

export function PilihRekomendasiForm({
  transactionId,
  kosList,
  initialSelectedIds,
  requiredCount,
}: {
  transactionId: string
  kosList: KosOption[]
  initialSelectedIds: string[]
  requiredCount: number
}) {
  const [state, formAction, isPending] = useActionState(
    saveRecommendations.bind(null, transactionId),
    undefined
  )
  const [selected, setSelected] = useState<string[]>(initialSelectedIds)
  const [showAll, setShowAll] = useState(false)

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= requiredCount) return prev
      return [...prev, id]
    })
  }

  const isComplete = selected.length === requiredCount

  // Pisahkan kos yang cocok (skor > 0) dan yang tidak
  const matched = kosList.filter((k) => k.matchScore > 0)
  const unmatched = kosList.filter((k) => k.matchScore <= 0)
  const hasFilter = kosList.some((k) => k.matchScore !== 0)

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-10 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium text-green-800 sm:text-base">
          Rekomendasi berhasil disimpan.
        </p>
        <Link
          href="/admin/transaksi"
          className="mt-2 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 lg:py-3 lg:text-[15px]"
        >
          Kembali ke daftar transaksi
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Kos yang cocok kriteria */}
      {hasFilter ? (
        <>
          {matched.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-fimo-navy" />
                <p className="text-sm font-semibold text-fimo-navy">
                  Cocok kriteria ({matched.length})
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {matched.map((k) => (
                  <KosCard
                    key={k.id}
                    kos={k}
                    isChecked={selected.includes(k.id)}
                    isDisabled={!selected.includes(k.id) && selected.length >= requiredCount}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Tidak ada kos yang cocok dengan kriteria pencari. Pilih secara manual dari daftar di bawah.
            </div>
          )}

          {/* Kos yang tidak cocok — collapsed by default */}
          {unmatched.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
              >
                {showAll
                  ? `Sembunyikan kos lainnya`
                  : `Tampilkan ${unmatched.length} kos lainnya (tidak cocok kriteria)`}
              </button>

              {showAll && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {unmatched.map((k) => (
                    <KosCard
                      key={k.id}
                      kos={k}
                      isChecked={selected.includes(k.id)}
                      isDisabled={!selected.includes(k.id) && selected.length >= requiredCount}
                      onToggle={toggle}
                      dimmed
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Tidak ada preferensi — tampilkan semua flat
        <div className="grid gap-3 sm:grid-cols-2">
          {kosList.map((k) => (
            <KosCard
              key={k.id}
              kos={k}
              isChecked={selected.includes(k.id)}
              isDisabled={!selected.includes(k.id) && selected.length >= requiredCount}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      {kosList.length === 0 && (
        <div className="rounded-xl border border-fimo-gray bg-white px-5 py-10 text-center text-sm text-gray-500">
          Tidak ada kos aktif yang tersedia.
        </div>
      )}

      {/* Sticky footer */}
      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-fimo-gray bg-white px-4 py-3.5 shadow-md sm:px-5">
        <p className="text-sm font-medium lg:text-[15px]">
          <span className={isComplete ? 'text-fimo-navy' : 'text-gray-900'}>
            {selected.length}
          </span>
          <span className="text-gray-400"> / {requiredCount} kos dipilih</span>
        </p>
        <button
          type="submit"
          disabled={!isComplete || isPending}
          className="rounded-xl bg-fimo-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:cursor-not-allowed disabled:opacity-40 lg:py-3 lg:text-[15px]"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Rekomendasi'}
        </button>
      </div>
    </form>
  )
}

function KosCard({
  kos,
  isChecked,
  isDisabled,
  onToggle,
  dimmed = false,
}: {
  kos: KosOption
  isChecked: boolean
  isDisabled: boolean
  onToggle: (id: string) => void
  dimmed?: boolean
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 shadow-sm transition-colors ${
        isChecked
          ? 'border-fimo-navy bg-fimo-navy/5'
          : isDisabled
            ? 'cursor-not-allowed border-fimo-gray bg-gray-50 opacity-50'
            : dimmed
              ? 'border-fimo-gray bg-white opacity-60 hover:opacity-100 hover:border-fimo-blue/40'
              : 'border-fimo-gray bg-white hover:border-fimo-blue/40'
      }`}
    >
      <input
        type="checkbox"
        name="kosId"
        value={kos.id}
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => onToggle(kos.id)}
        className="absolute right-4 top-4 h-4 w-4 accent-fimo-navy lg:h-[18px] lg:w-[18px]"
      />

      <p className="pr-6 text-sm font-medium text-gray-900 sm:text-base">
        {kos.name}
      </p>

      <div className="flex items-start gap-1 text-xs text-gray-500">
  <MapPinIcon className="mt-0.5 h-3 w-3 shrink-0" />
  <div className="min-w-0">
    <p className="font-medium text-gray-700">{kos.city}</p>
    <p className="break-words leading-relaxed">{kos.address}</p>
  </div>
</div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-fimo-navy/10 px-2 py-0.5 font-medium text-fimo-navy">
          Rp{kos.priceMonthly.toLocaleString('id-ID')}/bln
        </span>
        {kos.roomType && (
          <span className="rounded-full bg-fimo-gray px-2 py-0.5 text-gray-600">
            {kos.roomType}
          </span>
        )}
      </div>

      {kos.facilities.length > 0 && (
        <p className="flex items-start gap-1 text-xs text-gray-400">
          <TagIcon className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{kos.facilities.join(', ')}</span>
        </p>
      )}

      {/* Match reasons */}
      {kos.matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {kos.matchReasons.map((r) => (
            <span
              key={r}
              className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </label>
  )
}