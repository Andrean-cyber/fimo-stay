import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setupKosIndex, syncKosToIndex } from '@/lib/meilisearch'
import { requireAdminApi } from '@/utils/auth/require-admin'

export async function POST() {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await setupKosIndex()

  const semuaKos = await prisma.kos.findMany()
  for (const kos of semuaKos) {
    await syncKosToIndex(kos)
  }

  return NextResponse.json({ ok: true, count: semuaKos.length })
}