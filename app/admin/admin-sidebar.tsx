'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { NavLink } from './nav-link'
import { LogoutButton } from './logout-button'
import { NAV_ITEMS, type NavItem, type NavBadgeKey } from './nav-items'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { getKosNeedConfirmationCount } from './kos/actions'

function getActiveHref(pathname: string, items: NavItem[]) {
  const matches = items.filter((item) =>
    item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
  )
  if (matches.length === 0) return null
  return matches.reduce((longest, item) => (item.href.length > longest.length ? item.href : longest), matches[0].href)
}

export function AdminSidebar({
  role,
  displayName,
  badgeCounts = {},
}: {
  role: string | null
  displayName: string
  badgeCounts?: Partial<Record<NavBadgeKey, number>>
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => !item.superadminOnly || role === 'SUPERADMIN')
  const activeHref = getActiveHref(pathname, items)

  // Badge "Konfirmasi Kos" di-refresh realtime — nilai awal dari server,
  // lalu di-update lagi tiap ada perubahan di tabel kos, tanpa reload halaman.
  const [kosNeedConfirmationCount, setKosNeedConfirmationCount] = useState(
    badgeCounts.kosNeedConfirmation ?? 0
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('kos-confirmation-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kos' },
        () => {
          // Debounce: confirmKosAvailabilityBulk bisa update banyak baris
          // sekaligus, tiap baris memicu event terpisah — tunggu 500ms
          // sepi dulu baru fetch ulang count, biar tidak spam query.
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(async () => {
            const count = await getKosNeedConfirmationCount()
            setKosNeedConfirmationCount(count)
          }, 500)
        }
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [])

  const resolvedBadgeCounts: Partial<Record<NavBadgeKey, number>> = {
    ...badgeCounts,
    kosNeedConfirmation: kosNeedConfirmationCount,
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-fimo-gray bg-white px-4 py-3 md:hidden">
        <Image src="/lgfimostay-blue.webp" alt="FimoStay" width={110} height={28} priority />
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-fimo-navy hover:bg-fimo-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fimo-navy/40"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-fimo-navy text-white transition-transform duration-200 md:static md:translate-x-0 lg:w-72 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex items-center justify-center border-b border-white/10 px-5 py-4 lg:px-6 lg:py-5">
          <Image src="/lgfimostay-white.webp" alt="FimoStay" width={130} height={32} priority />
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 lg:space-y-1.5 lg:p-4">
          {items.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              isActive={item.href === activeHref}
              badgeCount={item.badgeKey ? resolvedBadgeCounts[item.badgeKey] : undefined}
            />
          ))}
        </nav>

        <div className="flex flex-col items-center border-t border-white/10 p-4 text-center lg:p-5">
          <p className="mb-2 truncate text-xs text-white/60 sm:text-sm">{displayName}</p>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}