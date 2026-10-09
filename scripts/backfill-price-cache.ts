// // scripts/backfill-price-cache.ts
// import { prisma } from '@/lib/prisma'

// async function main() {
//   const allKos = await prisma.kos.findMany({ select: { id: true } })
//   for (const k of allKos) {
//     const agg = await prisma.kosRoomType.aggregate({
//       where: { isActive: true, segment: { kosId: k.id } },
//       _min: { priceMonthly: true },
//       _max: { priceMonthly: true },
//     })
//     await prisma.kos.update({
//       where: { id: k.id },
//       data: { priceMinCache: agg._min.priceMonthly, priceMaxCache: agg._max.priceMonthly },
//     })
//   }
// }

// main()

// Jalankan: npx tsx --env-file=.env scripts/backfill-price-cache.ts
// Menghitung ulang Kos.priceMinCache & priceMaxCache dari KosRoomType aktif.
//   min = MIN(priceMonthly)
//   max = MAX(priceMaxMonthly ?? priceMonthly)
// Aman dijalankan berulang kali (idempotent): hanya meng-update kos yang nilainya berubah.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const kosList = await prisma.kos.findMany({
    select: {
      id: true,
      name: true,
      priceMinCache: true,
      priceMaxCache: true,
      segments: {
        select: {
          roomTypes: {
            where: { isActive: true },
            select: { priceMonthly: true, priceMaxMonthly: true },
          },
        },
      },
    },
  })

  let updated = 0
  let unchanged = 0

  for (const kos of kosList) {
    const roomTypes = kos.segments.flatMap((s) => s.roomTypes)

    const nextMin = roomTypes.length ? Math.min(...roomTypes.map((r) => r.priceMonthly)) : null
    const nextMax = roomTypes.length
      ? Math.max(...roomTypes.map((r) => r.priceMaxMonthly ?? r.priceMonthly))
      : null

    if (kos.priceMinCache === nextMin && kos.priceMaxCache === nextMax) {
      unchanged++
      continue
    }

    await prisma.kos.update({
      where: { id: kos.id },
      data: { priceMinCache: nextMin, priceMaxCache: nextMax },
    })
    updated++
    console.log(`✔ ${kos.name}: ${kos.priceMinCache}-${kos.priceMaxCache} → ${nextMin}-${nextMax}`)
  }

  console.log(`\nSelesai. Total ${kosList.length} kos | diupdate ${updated} | tidak berubah ${unchanged}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
