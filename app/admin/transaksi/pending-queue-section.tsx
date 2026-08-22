'use client'

import { useState, useTransition } from 'react'
import { PendingTransactionCard } from './pending-transaction-card'
import type { PendingCardData } from './queue-helpers'

export function PendingQueueSection({
  initialItems,
  total,
  loadMore,
}: {
  initialItems: PendingCardData[]
  total: number
  loadMore: (skip: number) => Promise<PendingCardData[]>
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

  function handleDone(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-fimo-gray bg-white px-5 py-10 text-center">
        <p className="text-sm text-gray-500">Semua transaksi sudah diverifikasi.</p>
      </div>
    )
  }

  return (
    <>
      {items.map((t) => (
        <PendingTransactionCard key={t.id} t={t} onDone={handleDone} />
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