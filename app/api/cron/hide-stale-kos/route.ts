import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncKosToIndex } from '@/lib/meilisearch'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const kosToHide = await prisma.kos.findMany({
    where: { status: 'ACTIVE', lastUpdatedAt: { lt: sevenDaysAgo } },
  })

  await prisma.kos.updateMany({
    where: { id: { in: kosToHide.map((k) => k.id) } },
    data: { status: 'HIDDEN_STALE' },
  })

  for (const kos of kosToHide) {
    await syncKosToIndex({ ...kos, status: 'HIDDEN_STALE' })
  }

  return NextResponse.json({ hidden: kosToHide.length })
}