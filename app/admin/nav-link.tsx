'use client'

import Link from 'next/link'
import type { NavItem } from './nav-items'

export function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  badgeCount,
}: NavItem & { isActive: boolean; badgeCount?: number }) {
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
      <span className="flex-1 truncate">{label}</span>
      {!!badgeCount && badgeCount > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Link>
  )
}