import { Meilisearch } from "meilisearch";
import { toPublicUrl } from '@/lib/r2'   // ⬅️ ganti definisi lokal jadi import ini

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
    searchableAttributes: ['name', 'city', 'description'],
    filterableAttributes: ['status', 'city', 'kosTypes', 'priceMin', 'priceMax', 'facilities'],
    sortableAttributes: ['priceMin', 'priceMax', 'createdAt'],
  })
}

type KosForIndex = {
  id: string
  name: string
  slug: string
  description: string | null
  city: string
  facilities: string[]
  status: string
  createdAt: Date
  media: { url: string; isCover: boolean; order: number }[]
  segments: {
    kosType: { name: string }
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

// (hapus function toPublicUrl yang lama di sini)

export async function syncKosToIndex(kos: KosForIndex) {
  if (kos.status !== 'ACTIVE') {
    await kosIndex.deleteDocument(kos.id)
    return
  }

  const activeRoomTypes = kos.segments
    .flatMap((s) => s.roomTypes)
    .filter((rt) => rt.isActive)

  const prices = activeRoomTypes.map((rt) => rt.priceMonthly)

  if (prices.length === 0) {
    await kosIndex.deleteDocument(kos.id)
    return
  }

  const kosTypes = [...new Set(kos.segments.map((s) => s.kosType.name))]

  const sortedMedia = [...kos.media].sort((a, b) => a.order - b.order)
  const cover = sortedMedia.find((m) => m.isCover) ?? sortedMedia[0]

  const primaryNearby = kos.nearby
    .filter((n) => n.isActive)
    .sort((a, b) => a.order - b.order)[0]

  await kosIndex.addDocuments([
    {
      id: kos.id,
      name: kos.name,
      slug: kos.slug,
      description: kos.description,
      city: kos.city,
      facilities: kos.facilities,
      status: kos.status,
      kosTypes,
      priceMin: Math.min(...prices),
      priceMax: Math.max(...prices),
      coverImageUrl: cover ? toPublicUrl(cover.url) : null,
      nearbyText: primaryNearby
        ? `${primaryNearby.distanceText} ke ${primaryNearby.name}`
        : null,
      createdAt: kos.createdAt.getTime(),
    },
  ])
}

export async function searchKos(query: string, filter?: string) {
  return kosIndex.search(query, { filter })
}

export async function resyncKos(prisma: any, kosId: string) {
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