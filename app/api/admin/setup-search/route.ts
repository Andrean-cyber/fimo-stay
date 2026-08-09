import { NextResponse } from 'next/server'
import { setupKosIndex } from '@/lib/meilisearch'
import { requireAdminApi } from '@/utils/auth/require-admin'

export async function POST() {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await setupKosIndex()
  return NextResponse.json({ ok: true })
}