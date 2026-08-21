'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { NeedPickItemData } from './queue-helpers'

export function VerifiedNeedPickSection({
  initialItems,
  total,
  loadMore,
}: {
  initialItems: NeedPickItemData[]
  total: number
  loadMore: (skip: number) => Promise<NeedPickItemData[]>
}) {
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const hasMore = items.length < total

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMore(items.length)
      setItems((prev) => [...prev, ...next])
    })
  }

  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
      <div className="border-b border-fimo-gray px-4 py-3.5 sm:px-5 sm:py-4">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Perlu Dipilihkan Rekomendasi</h2>
        <p className="text-xs text-gray-500">{total} transaksi menunggu dipilihkan kos</p>
      </div>
      <ul className="divide-y divide-fimo-gray">
        {items.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/transaksi/${t.id}/pilih-rekomendasi`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-fimo-gray/40 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 lg:text-[15px]">{t.searcherPhone}</p>
                <p className="truncate text-xs text-gray-500">
                  {t.preferenceSummary || 'Tanpa catatan preferensi'}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-fimo-navy lg:text-[15px]">
                Pilih 3 Kos
                <ArrowRightIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="w-full border-t border-fimo-gray px-5 py-3 text-center text-sm text-gray-500 transition-colors hover:bg-fimo-gray/20 disabled:opacity-60"
        >
          {isPending ? 'Memuat...' : `Muat Lebih Banyak (${total - items.length} lagi)`}
        </button>
      )}
    </div>
  )
}