// ============================================================
// FimoStay — scripts/backfill-meilisearch.mts
// Index ulang SEMUA data Kos dari database ke Meilisearch.
//
// Cara pakai:
//   npx tsx scripts/backfill-meilisearch.mts
//
// Butuh env var:
//   DIRECT_URL / DATABASE_URL  -> koneksi database (lewat Prisma)
//   MEILISEARCH_HOST           -> contoh: http://<container-name>:7700
//   MEILISEARCH_API_KEY        -> WAJIB pakai Admin API Key (bukan search key)
//                                 saat menjalankan script ini, karena butuh
//                                 akses tulis (createIndex, addDocuments, dst)
//
// Catatan penting:
//   Script ini SENGAJA TIDAK bikin mapping dokumen sendiri. Semua
//   mapping (field apa yang masuk index, dari mana asalnya) sudah
//   didefinisikan satu-satunya di syncKosToIndex() @/lib/meilisearch.
//   Backfill di sini hanya query semua kos dengan relasi lengkap
//   (persis seperti resyncKos()) lalu panggil syncKosToIndex() untuk
//   tiap kos. Ini supaya backfill dan sync runtime harian TIDAK PERNAH
//   drift satu sama lain — kalau field search berubah, cukup ubah
//   syncKosToIndex(), backfill otomatis ikut benar.
//
//   Kos dengan status != 'ACTIVE' atau belum punya priceMinCache/
//   priceMaxCache akan otomatis di-delete dari index oleh
//   syncKosToIndex() sendiri (bukan di-skip di sini) — supaya kos yang
//   baru saja jadi nonaktif juga ikut terbersihkan dari index lama.
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { setupKosIndex, syncKosToIndex } from '@/lib/meilisearch'

const prisma = new PrismaClient()

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  console.error(
    '❌ MEILISEARCH_HOST dan MEILISEARCH_API_KEY wajib di-set di .env sebelum menjalankan backfill.'
  )
  process.exit(1)
}

// Jeda antar dokumen (ms) supaya Meilisearch & Redis (bumpSearchVersion
// dipanggil tiap syncKosToIndex) tidak dibanjiri request sekaligus —
// VPS masih terbatas resource-nya.
const DELAY_MS = 50

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('⚙️  Memastikan index & settings sesuai (single source: lib/meilisearch.ts)...')
  await setupKosIndex()

  console.log('🔎 Mengambil semua data kos dari database (termasuk yang nonaktif, supaya ikut ke-cleanup dari index)...')

  const kosList = await prisma.kos.findMany({
    include: {
      media: { orderBy: { order: 'asc' } },
      nearby: { orderBy: { order: 'asc' } },
      segments: { include: { kosType: true, roomTypes: true } },
    },
  })

  console.log(`📦 Ditemukan ${kosList.length} kos total.`)

  let indexed = 0
  let skippedInactiveOrNoPrice = 0
  let failed = 0

  for (let i = 0; i < kosList.length; i++) {
    const kos = kosList[i]
    process.stdout.write(`  → [${i + 1}/${kosList.length}] ${kos.slug}... `)

    try {
      await syncKosToIndex(kos)

      if (kos.status !== 'ACTIVE' || kos.priceMinCache == null || kos.priceMaxCache == null) {
        skippedInactiveOrNoPrice++
        console.log('dihapus dari index (nonaktif / belum ada harga aktif)')
      } else {
        indexed++
        console.log('OK')
      }
    } catch (err) {
      failed++
      console.log('GAGAL')
      console.error(`    ⚠️  Error pada kos "${kos.slug}" (${kos.id}):`, err)
    }

    if (i < kosList.length - 1) {
      await delay(DELAY_MS)
    }
  }

  console.log('')
  console.log('🎉 Backfill selesai.')
  console.log(`   - Berhasil di-index: ${indexed}`)
  console.log(`   - Dihapus/di-skip (nonaktif / tanpa harga): ${skippedInactiveOrNoPrice}`)
  console.log(`   - Gagal: ${failed}`)

  if (failed > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((err) => {
    console.error('❌ Backfill gagal total:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
