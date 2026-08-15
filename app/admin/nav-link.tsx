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
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:px-3.5 lg:py-3 lg:text-[15px] ${
        isActive
          ? 'bg-white text-fimo-navy shadow-sm'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 lg:h-[18px] lg:w-[18px]" />
      {label}
    </Link>
  )
}
