// scripts/backfill-price-cache.ts
import { prisma } from '@/lib/prisma'

async function main() {
  const allKos = await prisma.kos.findMany({ select: { id: true } })
  for (const k of allKos) {
    const agg = await prisma.kosRoomType.aggregate({
      where: { isActive: true, segment: { kosId: k.id } },
      _min: { priceMonthly: true },
      _max: { priceMonthly: true },
    })
    await prisma.kos.update({
      where: { id: k.id },
      data: { priceMinCache: agg._min.priceMonthly, priceMaxCache: agg._max.priceMonthly },
    })
  }
}

main()