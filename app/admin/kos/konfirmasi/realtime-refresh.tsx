'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function KonfirmasiKosRealtimeRefresh() {
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('konfirmasi-kos-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kos' },
        () => {
          // Debounce sama seperti badge — hindari refresh berkali-kali
          // beruntun kalau ada bulk update (confirmKosAvailabilityBulk).
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            router.refresh()
          }, 500)
        }
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [router])

  return null // komponen ini tidak render apa-apa, cuma efek samping subscription
}