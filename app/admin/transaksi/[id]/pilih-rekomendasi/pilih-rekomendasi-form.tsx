'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  MapIcon,
  TagIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { saveRecommendations } from '../../actions'

type NearbyItem = { name: string; distanceText: string }

type KosOption = {
  id: string
  name: string
  city: string
  district: string | null
  address: string
  nearby: NearbyItem[]
  priceMonthly: number
  roomType: string | null
  facilities: string[]
  matchScore: number
  matchReasons: string[]
}

const PAGE_SIZE = 12

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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= requiredCount) return prev
      return [...prev, id]
    })
  }

  const isComplete = selected.length === requiredCount

  // Filter pencarian manual — admin bisa ketik nama kecamatan/kampus/jalan
  // (mis. "UB") untuk menyaring, di luar skor kecocokan otomatis. Ini murni
  // client-side (data sudah lengkap di kosList), jadi tidak perlu ke server
  // dan tidak mengganggu state seleksi kos yang sudah dicentang.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return kosList
    return kosList.filter((k) => {
      const haystack = [k.name, k.district ?? '', k.address, ...k.nearby.map((n) => n.name)]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [kosList, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const matchedCount = filtered.filter((k) => k.matchScore > 0).length

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

      {/* Cari manual — berguna kalau lokasi yang disebut pencari tidak
          otomatis kecocok skor (mis. admin di kota lain tidak familiar
          dengan nama jalan/kampus yang disebut pencari). */}
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Cari nama kos, kecamatan, jalan, atau lokasi terdekat (mis. UB)..."
          className="w-full rounded-xl border border-fimo-gray py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30"
        />
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} kos ditemukan
        {matchedCount > 0 && ` · ${matchedCount} cocok kriteria`}
      </p>

      {paginated.length === 0 ? (
        <div className="rounded-xl border border-fimo-gray bg-white px-5 py-10 text-center text-sm text-gray-500">
          Tidak ada kos yang cocok pencarian ini.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {paginated.map((k) => (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-xl border border-fimo-gray px-3 py-1.5 text-xs font-medium text-fimo-navy hover:bg-fimo-gray/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-gray-500">
            Halaman {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-xl border border-fimo-gray px-3 py-1.5 text-xs font-medium text-fimo-navy hover:bg-fimo-gray/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
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
}: {
  kos: KosOption
  isChecked: boolean
  isDisabled: boolean
  onToggle: (id: string) => void
}) {
  const primaryNearby = kos.nearby[0]

  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 shadow-sm transition-colors ${
        isChecked
          ? 'border-fimo-navy bg-fimo-navy/5'
          : isDisabled
            ? 'cursor-not-allowed border-fimo-gray bg-gray-50 opacity-50'
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
          <p className="font-medium text-gray-700">
            {kos.district ? `${kos.district}, ${kos.city}` : kos.city}
          </p>
          <p className="break-words leading-relaxed">{kos.address}</p>
        </div>
      </div>

      {primaryNearby && (
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <MapIcon className="h-3 w-3 shrink-0" />
          {primaryNearby.distanceText} ke {primaryNearby.name}
        </p>
      )}

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