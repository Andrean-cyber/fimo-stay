'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, MapPin, Tag } from 'lucide-react'
import { saveRecommendations } from '../../actions'

type KosOption = {
  id: string
  name: string
  city: string
  address: string
  priceMonthly: number
  roomType: string | null
  facilities: string[]
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

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= requiredCount) return prev // sudah penuh, abaikan klik
      return [...prev, id]
    })
  }

  const isComplete = selected.length === requiredCount

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-10 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium text-green-800 sm:text-base">Rekomendasi berhasil disimpan.</p>
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
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {kosList.map((k) => {
          const isChecked = selected.includes(k.id)
          const isDisabled = !isChecked && selected.length >= requiredCount
          return (
            <label
              key={k.id}
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
                value={k.id}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => toggle(k.id)}
                className="absolute right-4 top-4 h-4 w-4 accent-fimo-navy lg:h-[18px] lg:w-[18px]"
              />
              <p className="pr-6 text-sm font-medium text-gray-900 sm:text-base">{k.name}</p>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {k.address}, {k.city}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-fimo-navy/10 px-2 py-0.5 font-medium text-fimo-navy">
                  Rp{k.priceMonthly.toLocaleString('id-ID')}/bln
                </span>
                {k.roomType && (
                  <span className="rounded-full bg-fimo-gray px-2 py-0.5 text-gray-600">{k.roomType}</span>
                )}
              </div>
              {k.facilities.length > 0 && (
                <p className="flex items-start gap-1 text-xs text-gray-400">
                  <Tag className="mt-0.5 h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{k.facilities.join(', ')}</span>
                </p>
              )}
            </label>
          )
        })}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-fimo-gray bg-white px-4 py-3.5 shadow-md sm:px-5">
        <p className="text-sm font-medium lg:text-[15px]">
          <span className={isComplete ? 'text-fimo-navy' : 'text-gray-900'}>{selected.length}</span>
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
