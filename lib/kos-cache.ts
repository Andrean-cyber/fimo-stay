import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

export async function getSearchVersion() {
  return (await redis.get<number>('kos:list:version')) ?? 0
}

// panggil ini di: CRUD kos, update segment/roomType, auto-hide cron —
// supaya semua cache key hasil search lama otomatis basi
export async function bumpSearchVersion() {
  await redis.incr('kos:list:version')
}

export async function getKosTypes() {
  const cached = await redis.get<{ id: string; name: string }[]>('kos-types:list')
  if (cached) return cached

  const types = await prisma.kosType.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  await redis.set('kos-types:list', types, { ex: 3600 })
  return types
}

// panggil di endpoint CRUD KosType (create/update/delete)
export async function bumpKosTypesCache() {
  await redis.del('kos-types:list')
}