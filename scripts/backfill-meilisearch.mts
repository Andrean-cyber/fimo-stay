// ============================================================
// FimoStay — scripts/backfill-meilisearch.mts
// Index semua data Kos (status ACTIVE) dari database ke Meilisearch.
//
// Cara pakai:
//   npm run backfill:search
//
// Butuh env var:
//   DIRECT_URL / DATABASE_URL  -> koneksi database (lewat Prisma)
//   MEILISEARCH_HOST           -> contoh: http://<container-name>:7700
//   MEILISEARCH_API_KEY        -> WAJIB pakai Admin API Key (bukan search key)
//                                 saat menjalankan script ini, karena butuh
//                                 akses tulis (createIndex, addDocuments, dst)
//
// Catatan:
//   Settings index (searchable/filterable/sortable attributes) SEKARANG
//   diambil dari satu sumber saja: setupKosIndex() di @/lib/search.
//   Jangan duplikasi updateSettings() di file ini lagi — supaya app
//   runtime (syncKosToIndex) dan backfill script selalu konsisten.
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { setupKosIndex, kosIndex } from '@/lib/search'

const prisma = new PrismaClient()

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  console.error(
    '❌ MEILISEARCH_HOST dan MEILISEARCH_API_KEY wajib di-set di .env sebelum menjalankan backfill.'
  )
  process.exit(1)
}

// Ukuran batch dokumen yang dikirim per request ke Meilisearch.
// Kecil karena VPS masih terbatas RAM-nya — naikkan pelan-pelan
// kalau nanti resource VPS sudah di-upgrade.
const BATCH_SIZE = 50

// Jeda antar batch (ms) supaya Meilisearch sempat "napas" di RAM terbatas.
const BATCH_DELAY_MS = 500

type KosDocument = {
  id: string
  slug: string
  name: string
  description: string | null
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  facilities: string[]
  coverImageUrl: string | null
  kosTypes: string[]
  roomTypes: string[]
  priceMin: number | null
  priceMax: number | null
  totalAvailableRooms: number
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

async function main() {
  console.log('🔎 Mengambil data kos aktif dari database...')

  const kosList = await prisma.kos.findMany({
    where: { status: 'ACTIVE' },
    include: {
      media: {
        orderBy: [{ isCover: 'desc' }, { order: 'asc' }],
        take: 1,
      },
      segments: {
        include: {
          kosType: true,
          roomTypes: {
            where: { isActive: true },
          },
        },
      },
    },
  })

  console.log(`📦 Ditemukan ${kosList.length} kos aktif.`)

  const documents: KosDocument[] = kosList.map((kos) => {
    const allRoomTypes = kos.segments.flatMap((seg) => seg.roomTypes)
    const prices = allRoomTypes.map((rt) => rt.priceMonthly)

    return {
      id: kos.id,
      slug: kos.slug,
      name: kos.name,
      description: kos.description,
      address: kos.address,
      city: kos.city,
      latitude: kos.latitude,
      longitude: kos.longitude,
      facilities: kos.facilities,
      coverImageUrl: kos.media[0]?.url ?? null,

      kosTypes: [...new Set(kos.segments.map((seg) => seg.kosType.name))],
      roomTypes: [...new Set(allRoomTypes.map((rt) => rt.name))],
      priceMin: prices.length > 0 ? Math.min(...prices) : null,
      priceMax: prices.length > 0 ? Math.max(...prices) : null,
      totalAvailableRooms: allRoomTypes.reduce(
        (sum, rt) => sum + (rt.availableRooms ?? 0),
        0
      ),
    }
  })

  console.log('⚙️  Memastikan index & settings sesuai (single source: lib/search.ts)...')
  await setupKosIndex()

  const batches = chunk(documents, BATCH_SIZE)
  console.log(
    `🚀 Mengirim ${documents.length} dokumen dalam ${batches.length} batch (${BATCH_SIZE}/batch)...`
  )

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`  → Batch ${i + 1}/${batches.length} (${batch.length} dokumen)...`)

    const task = await kosIndex.addDocuments(batch)
    const finishedTask = await kosIndex.client.tasks.waitForTask(task.taskUid)

    if (finishedTask.status !== 'succeeded') {
      throw new Error(
        `Batch ${i + 1} gagal dengan status "${finishedTask.status}": ${JSON.stringify(finishedTask.error)}`
      )
    }

    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  console.log(
    `🎉 Selesai! ${documents.length} kos berhasil di-index ke Meilisearch dalam ${batches.length} batch.`
  )
}

main()
  .catch((err) => {
    console.error('❌ Backfill gagal:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })