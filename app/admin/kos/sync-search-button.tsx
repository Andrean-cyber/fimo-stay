'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export function SyncSearchButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/backfill-search', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal sync')
      setMessage(`Berhasil sync ${data.count} kos ke pencarian.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-fimo-gray/40 disabled:opacity-50 sm:w-auto sm:text-sm lg:px-5 lg:py-3 lg:text-[15px]"
      >
        <RefreshCw className={`h-4 w-4 lg:h-[18px] lg:w-[18px] ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Menyinkronkan...' : 'Sinkronkan ke Pencarian'}
      </button>
      {message && (
        <p className="absolute right-0 top-full mt-1.5 w-max max-w-xs text-xs text-gray-500">{message}</p>
      )}
    </div>
  )
}
