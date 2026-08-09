'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from './nav-items'

export function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname()
  const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-white text-fimo-navy'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}