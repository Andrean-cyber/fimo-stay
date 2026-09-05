import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

// TTL di sini cuma jaring pengaman kalau invalidasi event-based (dipanggil
// dari syncKosToIndex) entah kenapa tidak ke-trigger — bukan mekanisme
// utama. Mekanisme utamanya adalah invalidateKosDetailCache() yang
// dipanggil setiap kali kos di-update.
const KOS_DETAIL_TTL = 3600 // 1 jam

function kosDetailCacheKey(slug: string) {
  return `kos:detail:${slug}`
}

export type CachedRoomType = {
  id: string
  name: string
  priceMonthly: number
  description: string | null
  availableRooms: number | null
  isActive: boolean
  facilities: string[]
  order: number
}

export type CachedSegment = {
  id: string
  name: string | null
  kosType: { name: string }
  roomTypes: CachedRoomType[]
}

export type CachedNearby = {
  id: string
  name: string
  distanceText: string
}

export type CachedMedia = {
  id: string
  url: string
  isCover: boolean
  order: number
}

// Bentuk data SETELAH di-cache — sengaja BUKAN tipe Date untuk
// lastUpdatedAt (dipakai epoch ms/number), karena Date tidak selamat
// lewat JSON round-trip di Redis (bakal jadi string kalau dipaksa Date).
// Field turunan (priceMin/priceMax/cheapestId/updatedDaysAgo) SENGAJA
// TIDAK disimpan di sini — itu dihitung ulang tiap request di halaman
// detail, supaya tidak basi (mis. "3 hari lalu" ikut nge-freeze di cache).
export type CachedKosDetail = {
  id: string
  slug: string
  name: string
  description: string | null
  city: string
  district: string | null
  facilities: string[]
  lastUpdatedAt: number
  media: CachedMedia[]
  segments: CachedSegment[]
  nearby: CachedNearby[]
}

async function fetchKosDetailFromDb(slug: string): Promise<CachedKosDetail | null> {
  const kos = await prisma.kos.findUnique({
    where: { slug },
    include: {
      media: { orderBy: { order: 'asc' } },
      segments: {
        include: {
          kosType: true,
          roomTypes: { where: { isActive: true }, orderBy: { order: 'asc' } },
        },
      },
      nearby: { where: { isActive: true }, orderBy: { order: 'asc' } },
    },
  })

  // sengaja cek status manual di sini — meskipun Prisma bypass RLS,
  // kos yang tidak ACTIVE tetap tidak boleh terlihat publik ATAU di-cache
  if (!kos || kos.status !== 'ACTIVE') return null

  return {
    id: kos.id,
    slug: kos.slug,
    name: kos.name,
    description: kos.description,
    city: kos.city,
    district: kos.district,
    facilities: kos.facilities,
    lastUpdatedAt: kos.lastUpdatedAt.getTime(),
    media: kos.media.map((m) => ({ id: m.id, url: m.url, isCover: m.isCover, order: m.order })),
    segments: kos.segments.map((s) => ({
      id: s.id,
      name: s.name,
      kosType: { name: s.kosType.name },
      roomTypes: s.roomTypes.map((rt) => ({
        id: rt.id,
        name: rt.name,
        priceMonthly: rt.priceMonthly,
        description: rt.description,
        availableRooms: rt.availableRooms,
        isActive: rt.isActive,
        facilities: rt.facilities,
        order: rt.order,
      })),
    })),
    nearby: kos.nearby.map((n) => ({ id: n.id, name: n.name, distanceText: n.distanceText })),
  }
}

// Dipanggil dari halaman detail kos. Cek Redis dulu — kalau hit, Supabase
// TIDAK PERNAH dieksekusi sama sekali untuk request ini (query join media +
// segments + roomTypes + nearby yang mahal itu di-skip total). Kalau miss,
// query sekali ke Supabase lalu simpan hasilnya untuk request berikutnya.
export async function getKosDetailCached(slug: string): Promise<CachedKosDetail | null> {
  const cacheKey = kosDetailCacheKey(slug)

  try {
    const cached = await redis.get<CachedKosDetail>(cacheKey)
    if (cached) return cached
  } catch (err) {
    // Redis bermasalah bukan alasan untuk down-kan halaman detail —
    // fallback langsung ke Supabase tanpa cache
    console.error('[kos-detail-cache] Redis get gagal, fallback ke Supabase:', err)
  }

  const kos = await fetchKosDetailFromDb(slug)
  if (!kos) return null

  try {
    await redis.set(cacheKey, kos, { ex: KOS_DETAIL_TTL })
  } catch (err) {
    console.error('[kos-detail-cache] Redis set gagal (tidak fatal):', err)
  }

  return kos
}

// Dipanggil dari syncKosToIndex() setiap kali ada perubahan pada kos —
// satu titik saja, supaya tidak perlu sebar panggilan invalidasi ke semua
// admin action satu-satu. Aman dipanggil meski cache-nya tidak ada
// (redis.del terhadap key yang tidak ada = no-op).
export async function invalidateKosDetailCache(slug: string) {
  try {
    await redis.del(kosDetailCacheKey(slug))
  } catch (err) {
    console.error('[kos-detail-cache] Redis del gagal (tidak fatal):', err)
  }
}
