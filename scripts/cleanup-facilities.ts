// Jalankan sekali: npx tsx scripts/cleanup-facilities.ts
// Membersihkan value fasilitas di DB yang tidak ada lagi di whitelist
// FACILITIES / ROOM_FACILITIES (misal "Kasur" yang sudah dihapus dari
// ROOM_FACILITIES tapi masih tersimpan di data lama).

import { PrismaClient } from '@prisma/client'
import { FACILITIES, ROOM_FACILITIES } from '../lib/constants'
import { invalidateKosDetailCache } from '../lib/kos-detail-cache'

const prisma = new PrismaClient()

async function main() {
  const affectedSlugs = new Set<string>()

  // 1. Bersihkan facilities umum di tabel Kos
  const allKos = await prisma.kos.findMany({ select: { id: true, slug: true, facilities: true } })
  for (const kos of allKos) {
    const cleaned = kos.facilities.filter((f) => FACILITIES.includes(f))
    if (cleaned.length !== kos.facilities.length) {
      await prisma.kos.update({ where: { id: kos.id }, data: { facilities: cleaned } })
      console.log(`Kos ${kos.id}: ${kos.facilities.join(', ')} -> ${cleaned.join(', ')}`)
      affectedSlugs.add(kos.slug)
    }
  }

  // 2. Bersihkan facilities kamar di tabel KosRoomType
  const allRoomTypes = await prisma.kosRoomType.findMany({
    select: { id: true, facilities: true, segment: { select: { kos: { select: { slug: true } } } } },
  })
  for (const rt of allRoomTypes) {
    const cleaned = rt.facilities.filter((f) => ROOM_FACILITIES.includes(f))
    if (cleaned.length !== rt.facilities.length) {
      await prisma.kosRoomType.update({ where: { id: rt.id }, data: { facilities: cleaned } })
      console.log(`KosRoomType ${rt.id}: ${rt.facilities.join(', ')} -> ${cleaned.join(', ')}`)
      affectedSlugs.add(rt.segment.kos.slug)
    }
  }

  // 3. Invalidate cache Redis untuk semua kos yang datanya berubah —
  // kalau tidak, halaman publik akan tetap nampilin data lama sampai
  // TTL 1 jam habis.
  for (const slug of affectedSlugs) {
    await invalidateKosDetailCache(slug)
    console.log(`Cache invalidated: ${slug}`)
  }

  console.log(`Selesai. ${affectedSlugs.size} kos ter-invalidate.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
