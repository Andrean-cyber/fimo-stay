import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setupKosIndex, syncKosToIndex } from '@/lib/meilisearch'
import { requireAdminApi } from '@/utils/auth/require-admin'

export const maxDuration = 300 // detik — perpanjang timeout kalau platform-mu mendukung (mis. Vercel Pro)

const CONCURRENCY = 10

export async function POST() {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await setupKosIndex()

  const semuaKos = await prisma.kos.findMany({
    include: {
      media: { orderBy: { order: 'asc' } },
      nearby: { orderBy: { order: 'asc' } },
      segments: { include: { roomTypes: true, kosType: true } },
    },
  })

  let failed = 0
  for (let i = 0; i < semuaKos.length; i += CONCURRENCY) {
    const batch = semuaKos.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map((kos) => syncKosToIndex(kos)))
    for (const r of results) {
      if (r.status === 'rejected') {
        failed++
        console.error('[backfill-search] gagal sync:', r.reason)
      }
    }
  }

  return NextResponse.json({ ok: true, count: semuaKos.length, failed })
}