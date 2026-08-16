'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function TransaksiLiveBanner() {
  const [count, setCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('transaksi-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        () => {
          setCount((prev) => prev + 1)
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
      {count === 1 ? 'Ada 1 transaksi baru' : `Ada ${count} transaksi baru`} — klik untuk refresh
    </button>
  )
}
