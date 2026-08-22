// lib/kos-price-cache.ts
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function recomputeKosPriceCache(
  kosId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  const agg = await tx.kosRoomType.aggregate({
    where: { isActive: true, segment: { kosId } },
    _min: { priceMonthly: true },
    _max: { priceMonthly: true },
  })

  await tx.kos.update({
    where: { id: kosId },
    data: {
      priceMinCache: agg._min.priceMonthly,
      priceMaxCache: agg._max.priceMonthly,
    },
  })
}