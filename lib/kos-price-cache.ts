import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function recomputeKosPriceCache(
  kosId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  const agg = await tx.kosRoomType.aggregate({
    where: { isActive: true, segment: { kosId } },
    _min: { priceMonthly: true },
    _max: { priceMonthly: true, priceMaxMonthly: true },
  })

  const min = agg._min.priceMonthly
  // max = yang terbesar antara harga pas (priceMonthly) dan harga maks (priceMaxMonthly).
  // Setara dengan MAX(COALESCE(priceMaxMonthly, priceMonthly)) di schema.
  const max =
    agg._max.priceMonthly == null
      ? null
      : Math.max(agg._max.priceMonthly, agg._max.priceMaxMonthly ?? 0)

  await tx.kos.update({
    where: { id: kosId },
    data: {
      priceMinCache: min,
      priceMaxCache: max,
    },
  })
}