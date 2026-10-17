import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/utils/auth/require-admin'

export async function GET(req: Request) {
  const admin = await requireAdminApi()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''

  const owners = await prisma.owner.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
    take: 15,
  })

  return NextResponse.json(owners)
}