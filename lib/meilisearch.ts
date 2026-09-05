import { Meilisearch } from 'meilisearch'
import { toPublicUrl } from '@/lib/r2'
import { bumpSearchVersion } from '@/lib/kos-cache'
import { invalidateKosDetailCache } from '@/lib/kos-detail-cache'

export const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
})

export const kosIndex = meili.index('kos')

// ------------------------------------------------------------
// Bentuk dokumen SETELAH di-index (hasil query search) —
// dipakai di page.tsx dan file lain yang baca hasil search.
// Beda dengan KosForIndex di bawah (bentuk SEBELUM index, masih
// include relasi Prisma mentah).
// ------------------------------------------------------------
export type KosDocument = {
  id: string
  slug: string
  name: string
  description: string | null
  city: string
  district: string | null
  facilities: string[]
  status: string
  kosTypeIds: string[]
  kosTypeNames: string[]
  campusNames: string[]
  priceMin: number
  priceMax: number
  imageUrl: string | null
  nearbyText: string | null
  lastUpdatedAt: number
}

export async function setupKosIndex() {
  try {
    await meili.createIndex('kos', { primaryKey: 'id' })
  } catch (err: any) {
    if (err?.code !== 'index_already_exists') throw err
  }

  await kosIndex.updateSettings({
    searchableAttributes: ['name', 'city', 'district', 'description'],
    filterableAttributes: ['status', 'city', 'kosTypeIds', 'campusNames', 'priceMin', 'priceMax', 'facilities'],
    sortableAttributes: ['priceMin', 'priceMax', 'lastUpdatedAt'],
  })
}

// ------------------------------------------------------------
// Bentuk data SEBELUM di-index — hasil query Prisma dengan
// relasi lengkap (segments, roomTypes, nearby, media).
// ------------------------------------------------------------
type KosForIndex = {
  id: string
  name: string
  slug: string
  description: string | null
  city: string
  district: string | null
  facilities: string[]
  status: string
  lastUpdatedAt: Date
  priceMinCache: number | null
  priceMaxCache: number | null
  media: { url: string; isCover: boolean; order: number }[]
  segments: {
    kosType: { id: string; name: string }
    roomTypes: {
      priceMonthly: number
      isActive: boolean
      availableRooms: number | null
    }[]
  }[]
  nearby: {
    name: string
    distanceText: string
    isActive: boolean
    order: number
  }[]
}

export async function syncKosToIndex(kos: KosForIndex) {
  // Titik tunggal invalidasi cache detail kos — dipanggil PALING AWAL,
  // sebelum early return apa pun, supaya kos yang berubah jadi nonaktif
  // atau kehilangan harga aktif juga ikut ke-invalidate (bukan cuma kos
  // yang tetap ACTIVE).
  await invalidateKosDetailCache(kos.slug)

  if (kos.status !== 'ACTIVE') {
    await kosIndex.deleteDocument(kos.id)
    await bumpSearchVersion()
    return
  }

  // pakai cache harga dari DB (priceMinCache/priceMaxCache), bukan hitung
  // ulang di sini — recomputeKosPriceCache() adalah satu-satunya sumber
  // kebenaran untuk harga, supaya tidak ada risiko drift logic
  if (kos.priceMinCache == null || kos.priceMaxCache == null) {
    await kosIndex.deleteDocument(kos.id)
    await bumpSearchVersion()
    return
  }

  const kosTypeIds = [...new Set(kos.segments.map((s) => s.kosType.id))]
  const kosTypeNames = [...new Set(kos.segments.map((s) => s.kosType.name))]

  const activeNearby = kos.nearby
    .filter((n) => n.isActive)
    .sort((a, b) => a.order - b.order)

  const campusNames = activeNearby.map((n) => n.name)
  const primaryNearby = activeNearby[0]

  const sortedMedia = [...kos.media].sort((a, b) => a.order - b.order)
  const cover = sortedMedia.find((m) => m.isCover) ?? sortedMedia[0]

  const document: KosDocument = {
    id: kos.id,
    slug: kos.slug,
    name: kos.name,
    description: kos.description,
    city: kos.city,
    district: kos.district,
    facilities: kos.facilities,
    status: kos.status,
    kosTypeIds,
    kosTypeNames,
    campusNames,
    priceMin: kos.priceMinCache,
    priceMax: kos.priceMaxCache,
    imageUrl: cover ? toPublicUrl(cover.url) : null,
    nearbyText: primaryNearby
      ? `${primaryNearby.distanceText} ke ${primaryNearby.name}`
      : null,
    lastUpdatedAt: kos.lastUpdatedAt.getTime(),
  }

  await kosIndex.addDocuments([document])

  // pastikan cache listing versioned (search:v{n}:...) langsung basi
  // begitu index berubah, bukan nunggu TTL 45 detik habis
  await bumpSearchVersion()
}

export async function searchKos(query: string, filter?: string) {
  return kosIndex.search<KosDocument>(query, { filter })
}

type PrismaClientLike = {
  kos: {
    findUniqueOrThrow: (args: any) => Promise<KosForIndex>
  }
}

export async function resyncKos(prisma: PrismaClientLike, kosId: string) {
  const kos = await prisma.kos.findUniqueOrThrow({
    where: { id: kosId },
    include: {
      media: { orderBy: { order: 'asc' } },
      nearby: { orderBy: { order: 'asc' } },
      segments: { include: { kosType: true, roomTypes: true } },
    },
  })
  await syncKosToIndex(kos)
}
