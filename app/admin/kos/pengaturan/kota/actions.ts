'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { revalidatePath } from 'next/cache'
import { normalizeCityName } from '@/lib/constants'
import { redis, KOS_CITY_COUNTS_CACHE_KEY } from '@/lib/redis'

export async function mergeCities(fromCities: string[], toCity: string) {
  await requireAdmin()

  const target = normalizeCityName(toCity)
  const citiesToUpdate = fromCities.filter((c) => c !== target)
  if (citiesToUpdate.length === 0) return

  await prisma.kos.updateMany({
    where: { city: { in: citiesToUpdate } },
    data: { city: target },
  })

  try {
    await redis.del(KOS_CITY_COUNTS_CACHE_KEY)
  } catch {
    // cache gagal dihapus bukan fatal, TTL akan expire sendiri
  }

  revalidatePath('/admin/kos')
  revalidatePath('/admin/kos/pengaturan/kota')
}