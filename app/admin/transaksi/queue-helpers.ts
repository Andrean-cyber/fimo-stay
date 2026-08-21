import { prisma } from '@/lib/prisma'
import { getReferenceCode } from '@/lib/constants'
import { formatPreferenceSummary } from '@/lib/format-preference'

export const PAGE_SIZE = 15

export type PendingCardData = {
  id: string
  type: 'SELF_SEARCH' | 'RECOMMENDATION'
  refCode: string
  amount: number
  searcherPhone: string
  targetKosName: string | null
  preferenceSummary: string | null
}

export type NeedPickItemData = {
  id: string
  searcherPhone: string
  preferenceSummary: string | null
}

export async function fetchPendingPage(skip: number, take: number = PAGE_SIZE): Promise<PendingCardData[]> {
  const rows = await prisma.transaction.findMany({
    where: { status: 'PENDING' },
    include: { searcher: true, targetKos: true },
    orderBy: { createdAt: 'asc' },
    skip,
    take,
  })

  return rows.map((t) => ({
    id: t.id,
    type: t.type,
    refCode: getReferenceCode(t.id),
    amount: t.amount,
    searcherPhone: t.searcher.phone,
    targetKosName: t.targetKos?.name ?? null,
    preferenceSummary: formatPreferenceSummary(t.preferenceNotes),
  }))
}

export async function fetchVerifiedNeedPickPage(skip: number, take: number = PAGE_SIZE): Promise<NeedPickItemData[]> {
  const rows = await prisma.transaction.findMany({
    where: { status: 'VERIFIED', type: 'RECOMMENDATION', recommendationItems: { none: {} } },
    include: { searcher: true },
    orderBy: { verifiedAt: 'asc' },
    skip,
    take,
  })

  return rows.map((t) => ({
    id: t.id,
    searcherPhone: t.searcher.phone,
    preferenceSummary: formatPreferenceSummary(t.preferenceNotes),
  }))
}