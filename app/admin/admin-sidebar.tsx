'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { NavLink } from './nav-link'
import { LogoutButton } from './logout-button'
import { NAV_ITEMS } from './nav-items'

export function AdminSidebar({
  role,
  displayName,
}: {
  role: string | null
  displayName: string
}) {
  const [open, setOpen] = useState(false)
  const items = NAV_ITEMS.filter((item) => !item.superadminOnly || role === 'SUPERADMIN')

  return (
    <>
      <div className="flex items-center justify-between border-b border-fimo-gray bg-white px-4 py-3 md:hidden">
        <Image src="/lgfimostay-blue.webp" alt="FimoStay" width={110} height={28} priority />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-fimo-navy hover:bg-fimo-gray" aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-fimo-navy text-white transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex items-center justify-center border-b border-white/10 px-5 py-4">
          <Image src="/lgfimostay-white.webp" alt="FimoStay" width={130} height={32} priority />
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="flex flex-col items-center border-t border-white/10 p-4 text-center">
          <p className="mb-2 truncate text-sm text-white/60">{displayName}</p>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}