import { Meilisearch } from "meilisearch";

export const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
})

export const kosIndex = meili.index('kos')

export async function setupKosIndex() {
  try {
    await meili.createIndex('kos', { primaryKey: 'id' })
  } catch (err: any) {
    if (err?.code !== 'index_already_exists') throw err
  }

  await kosIndex.updateSettings({
    // address sengaja TIDAK masuk sini — belum boleh publik sebelum transaksi VERIFIED
    searchableAttributes: ['name', 'city', 'description'],
    filterableAttributes: ['status', 'city', 'kosTypes', 'priceMin', 'priceMax', 'facilities'],
    sortableAttributes: ['priceMin', 'priceMax', 'createdAt'],
  })
}

// Bentuk data yang dibutuhkan fungsi ini — ambil dari Prisma dengan
// include segments -> kosType & roomTypes
type KosForIndex = {
  id: string
  name: string
  slug: string
  description: string | null
  city: string
  facilities: string[]
  status: string
  createdAt: Date
  media: { url: string }[]
  segments: {
    kosType: { name: string }
    roomTypes: {
      priceMonthly: number
      isActive: boolean
      availableRooms: number | null
    }[]
  }[]
}

export async function syncKosToIndex(kos: KosForIndex) {
  if (kos.status !== 'ACTIVE') {
    await kosIndex.deleteDocument(kos.id)
    return
  }

  const activeRoomTypes = kos.segments
    .flatMap((s) => s.roomTypes)
    .filter((rt) => rt.isActive)

  const prices = activeRoomTypes.map((rt) => rt.priceMonthly)

  // Kos tanpa room type aktif = tidak ada harga valid untuk difilter,
  // jadi lebih aman dikeluarkan dulu dari index daripada tampil dengan
  // priceMin/priceMax kosong/ngaco
  if (prices.length === 0) {
    await kosIndex.deleteDocument(kos.id)
    return
  }

  const kosTypes = [...new Set(kos.segments.map((s) => s.kosType.name))]

  await kosIndex.addDocuments([
    {
      id: kos.id,
      name: kos.name,
      slug: kos.slug,
      description: kos.description,
      city: kos.city,
      facilities: kos.facilities,
      status: kos.status,
      kosTypes,          // array, karena 1 kos bisa punya beberapa segment/jenis
      priceMin: Math.min(...prices),
      priceMax: Math.max(...prices),
      coverImageUrl: kos.media[0]?.url ?? null, // ← tambahan
      createdAt: kos.createdAt.getTime(),
    },
  ])
}

export async function searchKos(query: string, filter?: string) {
  return kosIndex.search(query, { filter })
}