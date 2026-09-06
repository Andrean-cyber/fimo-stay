// lib/kos-form-options-cache.ts
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

const KOS_TYPES_CACHE_KEY = 'admin:kos:kos-types-options'
const OWNERS_CACHE_KEY = 'admin:kos:owners-options'
const CACHE_TTL = 300 // 5 menit — dropdown, bukan data kritikal

export async function getCachedKosTypes() {
  try {
    const cached = await redis.get<{ id: string; name: string }[]>(KOS_TYPES_CACHE_KEY)
    if (cached) return cached
  } catch {
    // Redis down, fallback ke DB
  }

  const kosTypes = await prisma.kosType.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  try {
    await redis.set(KOS_TYPES_CACHE_KEY, kosTypes, { ex: CACHE_TTL })
  } catch {
    // gagal simpan cache bukan fatal
  }

  return kosTypes
}

export async function getCachedOwners() {
  try {
    const cached = await redis.get<{ id: string; name: string }[]>(OWNERS_CACHE_KEY)
    if (cached) return cached
  } catch {
    // Redis down, fallback ke DB
  }

  const owners = await prisma.owner.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  try {
    await redis.set(OWNERS_CACHE_KEY, owners, { ex: CACHE_TTL })
  } catch {
    // gagal simpan cache bukan fatal
  }

  return owners
}

export async function invalidateKosTypesCache() {
  try {
    await redis.del(KOS_TYPES_CACHE_KEY)
  } catch {}
}

export async function invalidateOwnersCache() {
  try {
    await redis.del(OWNERS_CACHE_KEY)
  } catch {}
}