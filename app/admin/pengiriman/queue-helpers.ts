import { prisma } from '@/lib/prisma'
import { getReferenceCode } from '@/lib/constants'
import { buildWaLink } from '@/lib/whatsapp'
import { formatSelfSearchMessage, formatRecommendationMessage, type KosMessageDetail } from '@/lib/format-kos-message'
import { formatPreferenceSummary } from '@/lib/format-preference'

export const PAGE_SIZE = 15

export const kosDetailInclude = {
  owner: { select: { name: true, phone: true } },
  segments: {
    select: {
      name: true,
      kosType: { select: { name: true } },
      roomTypes: {
        where: { isActive: true },
        select: { name: true, priceMonthly: true, availableRooms: true, description: true, facilities: true },
      },
    },
  },
  nearby: {
    where: { isActive: true },
    orderBy: { order: 'asc' as const },
    select: { name: true, distanceText: true },
  },
} as const

type RawKos = {
  name: string
  description: string | null
  city: string
  district: string | null
  address: string
  facilities: string[]
  owner: { name: string; phone: string }
  segments: {
    name: string | null
    kosType: { name: string }
    roomTypes: { name: string; priceMonthly: number; availableRooms: number | null; description: string | null; facilities: string[] }[]
  }[]
  nearby: { name: string; distanceText: string }[]
}

function toKosMessageDetail(kos: RawKos): KosMessageDetail {
  return {
    name: kos.name,
    description: kos.description,
    city: kos.city,
    district: kos.district,
    address: kos.address,
    facilities: kos.facilities,
    ownerName: kos.owner.name,
    ownerPhone: kos.owner.phone,
    segments: kos.segments.map((s) => ({ name: s.name, kosTypeName: s.kosType.name, roomTypes: s.roomTypes })),
    nearby: kos.nearby,
  }
}

export type PengirimanCardData = {
  transactionId: string
  badgeLabel: string
  badgeClass: string
  refCode: string
  phone: string
  subtitle: string
  message: string
  waLink: string
}

export async function fetchSelfSearchPage(skip: number, take: number = PAGE_SIZE): Promise<PengirimanCardData[]> {
  const rows = await prisma.transaction.findMany({
    where: { status: 'VERIFIED', type: 'SELF_SEARCH', sentAt: null },
    include: { searcher: true, targetKos: { include: kosDetailInclude } },
    orderBy: { verifiedAt: 'asc' },
    skip,
    take,
  })

  return rows
    .filter((t): t is typeof t & { targetKos: NonNullable<typeof t.targetKos> } => Boolean(t.targetKos))
    .map((t) => {
      const message = formatSelfSearchMessage(t.id, toKosMessageDetail(t.targetKos))
      return {
        transactionId: t.id,
        badgeLabel: 'Cari Sendiri',
        badgeClass: 'bg-fimo-gray text-gray-600',
        refCode: getReferenceCode(t.id),
        phone: t.searcher.phone,
        subtitle: t.targetKos.name,
        message,
        waLink: buildWaLink(t.searcher.phone, message),
      }
    })
}

export async function fetchRecommendationPage(skip: number, take: number = PAGE_SIZE): Promise<PengirimanCardData[]> {
  const rows = await prisma.transaction.findMany({
    where: { status: 'VERIFIED', type: 'RECOMMENDATION', sentAt: null, recommendationItems: { some: {} } },
    include: {
      searcher: true,
      recommendationItems: { orderBy: { order: 'asc' }, include: { kos: { include: kosDetailInclude } } },
    },
    orderBy: { verifiedAt: 'asc' },
    skip,
    take,
  })

  return rows.map((t) => {
    const kosList = t.recommendationItems.map((r) => toKosMessageDetail(r.kos))
    const preferenceSummary = formatPreferenceSummary(t.preferenceNotes)
    const message = formatRecommendationMessage(t.id, preferenceSummary, kosList)
    return {
      transactionId: t.id,
      badgeLabel: 'Rekomendasi',
      badgeClass: 'bg-fimo-navy/10 text-fimo-navy',
      refCode: getReferenceCode(t.id),
      phone: t.searcher.phone,
      subtitle: `${kosList.length} kos${preferenceSummary ? ` — ${preferenceSummary}` : ''}`,
      message,
      waLink: buildWaLink(t.searcher.phone, message),
    }
  })
}