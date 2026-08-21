'use client'

import { useState, useTransition } from 'react'
import { PengirimanCard } from './pengiriman-card'
import type { PengirimanCardData } from './queue-helpers'

export function QueueSection({
  initialItems,
  total,
  loadMore,
}: {
  initialItems: PengirimanCardData[]
  total: number
  loadMore: (skip: number) => Promise<PengirimanCardData[]>
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
    <>
      {items.map((item) => (
        <PengirimanCard key={item.transactionId} {...item} />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="w-full rounded-2xl border border-dashed border-fimo-gray bg-white px-5 py-4 text-center text-sm text-gray-500 transition-colors hover:bg-fimo-gray/20 disabled:opacity-60"
        >
          {isPending ? 'Memuat...' : `Muat Lebih Banyak (${total - items.length} lagi)`}
        </button>
      )}
    </>
  )
}