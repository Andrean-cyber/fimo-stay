import {
    LayoutDashboard,
    Building2,
    Users,
    Receipt,
    ShieldCheck,
    type LucideIcon,
  } from 'lucide-react'
  
  export type NavItem = {
    href: string
    label: string
    icon: LucideIcon
    superadminOnly?: boolean
  }
  
  export const NAV_ITEMS: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/kos', label: 'Kos', icon: Building2 },
    { href: '/admin/owners', label: 'Owner', icon: Users },
    { href: '/admin/transaksi', label: 'Transaksi', icon: Receipt },
    { href: '/admin/team', label: 'Tim', icon: ShieldCheck, superadminOnly: true },
  ]