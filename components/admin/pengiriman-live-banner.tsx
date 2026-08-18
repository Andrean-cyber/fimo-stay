'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function PengirimanLiveBanner() {
  const [count, setCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('pengiriman-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions' },
        (payload) => {
          const before = payload.old as { status?: string; sent_at?: string | null }
          const after = payload.new as { status?: string; sent_at?: string | null }

          // masuk antrian: baru saja diverifikasi
          const masukAntrian = before.status !== 'VERIFIED' && after.status === 'VERIFIED' && after.sent_at == null

          // keluar antrian: baru saja ditandai terkirim (oleh admin lain)
          const keluarAntrian = before.sent_at == null && after.sent_at != null

          if (masukAntrian || keluarAntrian) {
            setCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (count === 0) return null

  return (
    <button
      onClick={() => {
        setCount(0)
        router.refresh()
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-fimo-blue/30 bg-fimo-blue/10 px-4 py-2.5 text-sm font-medium text-fimo-navy transition-colors hover:bg-fimo-blue/15"
    >
      <RefreshCw className="h-4 w-4" />
      Antrian pengiriman berubah — klik untuk refresh
    </button>
  )
}