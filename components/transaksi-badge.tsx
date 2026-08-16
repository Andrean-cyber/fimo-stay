'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function TransaksiBadge() {
  const [count, setCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  /*
   * Reset badge begitu admin sedang berada di halaman transaksi.
   */
  useEffect(() => {
    if (pathname?.startsWith('/admin/transaksi')) {
      setCount(0)
    }
  }, [pathname])

  /*
   * Subscribe ke insert baru di tabel transactions (sesuai @@map di schema.prisma).
   */
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('transaksi-baru')
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
    <button onClick={() => router.push('/admin/transaksi')} className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
      {count > 9 ? '9+' : count}
    </button>
  )
}
