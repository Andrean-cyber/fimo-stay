import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'

export type NavBadgeKey = 'kosNeedConfirmation'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  superadminOnly?: boolean
  badgeKey?: NavBadgeKey
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Squares2X2Icon },
  { href: '/admin/kos', label: 'Kos', icon: BuildingOffice2Icon },
  {
    href: '/admin/kos/konfirmasi',
    label: 'Konfirmasi Kos',
    icon: ClipboardDocumentCheckIcon,
    badgeKey: 'kosNeedConfirmation',
  },
  { href: '/admin/owners', label: 'Owner', icon: UsersIcon },
  { href: '/admin/transaksi', label: 'Transaksi', icon: DocumentTextIcon },
  { href: '/admin/pengiriman', label: 'Kirim Kos', icon: ChatBubbleLeftRightIcon },
  { href: '/admin/team', label: 'Tim', icon: ShieldCheckIcon, superadminOnly: true },
]