'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Tidak render UI apa pun. Pasang komponen ini di halaman publik mana pun
 * yang menampilkan listing kos (homepage, /kos) supaya listing-nya
 * otomatis ter-refresh begitu ada kos baru / status kos berubah,
 * tanpa pengunjung perlu reload halaman.
 *
 * router.refresh() cuma re-fetch data Server Component (Prisma query-nya
 * tetap jalan di server, join lengkap), bukan reload penuh — state client
 * (misal input pencarian yang sedang diketik) tidak hilang.
 */
export function KosLiveRefresher() {
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const scheduleRefresh = () => {
      // Debounce: kalau admin ubah beberapa kos beruntun, cukup 1x refresh.
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        router.refresh()
      }, 1200)
    }

    const channel = supabase
      .channel('kos-live-public')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kos' }, scheduleRefresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kos' }, scheduleRefresh)
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
