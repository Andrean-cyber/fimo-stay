// ============================================================
// FimoStay — scripts/backfill-meilisearch.mts
// Index semua data Kos (status ACTIVE) dari database ke Meilisearch.
//
// Cara pakai:
//   npm run backfill:search
//
// Butuh env var:
//   DIRECT_URL / DATABASE_URL  -> koneksi database (lewat Prisma)
//   MEILISEARCH_HOST           -> contoh: https://search.fimostay.com
//   MEILISEARCH_API_KEY        -> WAJIB pakai Admin API Key (bukan search key)
//                                 saat menjalankan script ini, karena butuh
//                                 akses tulis (createIndex, addDocuments, dst)
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Meilisearch } from 'meilisearch'

const prisma = new PrismaClient()

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  console.error(
    '❌ MEILISEARCH_HOST dan MEILISEARCH_API_KEY wajib di-set di .env sebelum menjalankan backfill.'
  )
  process.exit(1)
}

const client = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
})

const INDEX_NAME = 'kos'

type KosDocument = {
  id: string
  slug: string
  name: string
  description: string | null
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  priceMonthly: number
  roomType: string | null
  facilities: string[]
  coverImageUrl: string | null
}

async function main() {
  console.log('🔎 Mengambil data kos aktif dari database...')

  const kosList = await prisma.kos.findMany({
    where: { status: 'ACTIVE' },
    include: {
      media: {
        where: { isCover: true },
        take: 1,
      },
    },
  })

  console.log(`📦 Ditemukan ${kosList.length} kos aktif.`)

  const documents: KosDocument[] = kosList.map((kos) => ({
    id: kos.id,
    slug: kos.slug,
    name: kos.name,
    description: kos.description,
    address: kos.address,
    city: kos.city,
    latitude: kos.latitude,
    longitude: kos.longitude,
    priceMonthly: kos.priceMonthly,
    roomType: kos.roomType,
    facilities: kos.facilities,
    coverImageUrl: kos.media[0]?.url ?? null,
  }))

  console.log(`⚙️  Memastikan index "${INDEX_NAME}" ada...`)
  await client.createIndex(INDEX_NAME, { primaryKey: 'id' }).catch((err) => {
    // Index sudah ada -> aman untuk diabaikan
    if (err?.cause?.code !== 'index_already_exists') throw err
  })

  const index = client.index(INDEX_NAME)

  console.log('⚙️  Mengatur attribute pencarian & filter...')
  await index.updateSettings({
    searchableAttributes: ['name', 'description', 'address', 'city'],
    filterableAttributes: ['city', 'roomType', 'facilities', 'priceMonthly'],
    sortableAttributes: ['priceMonthly'],
  })

  console.log('🚀 Mengirim data ke Meilisearch...')
  const task = await index.addDocuments(documents)
  console.log(`✅ Task terkirim (taskUid: ${task.taskUid}). Menunggu selesai diproses...`)

  const finishedTask = await client.tasks.waitForTask(task.taskUid)

  if (finishedTask.status !== 'succeeded') {
    throw new Error(
      `Task gagal dengan status "${finishedTask.status}": ${JSON.stringify(finishedTask.error)}`
    )
  }

  console.log(`🎉 Selesai! ${documents.length} kos berhasil di-index ke Meilisearch.`)
}

main()
  .catch((err) => {
    console.error('❌ Backfill gagal:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
