import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  superadminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Squares2X2Icon },
  { href: '/admin/kos', label: 'Kos', icon: BuildingOffice2Icon },
  { href: '/admin/owners', label: 'Owner', icon: UsersIcon },
  { href: '/admin/transaksi', label: 'Transaksi', icon: DocumentTextIcon },
  { href: '/admin/pengiriman', label: 'Kirim Kos', icon: ChatBubbleLeftRightIcon },
  { href: '/admin/team', label: 'Tim', icon: ShieldCheckIcon, superadminOnly: true },
]