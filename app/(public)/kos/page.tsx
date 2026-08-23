import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { SearchForm } from './search-form'
import { FilterPanel } from './filter-panel'
import { EmptyState } from '@/components/empty-state'
import { SearchX } from 'lucide-react'
import { KosCard } from '@/components/kos-card'
import { Pagination } from '@/components/pagination'
import { toPublicUrl } from '@/lib/r2'
import { KAMPUS_POPULER } from '@/lib/campuses'
import type { Prisma } from '@prisma/client'
import { PublicFooter } from '@/components/public-footer'

const PAGE_SIZE = 20

export default async function KosSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; kategori?: string; priceMin?: string; priceMax?: string; kampus?: string; city?: string; page?: string }> }) {
  const { q = '', kategori = '', priceMin = '', priceMax = '', kampus = '', city = '', page = '1' } = await searchParams
  const activeFilterCount = [kategori, priceMin, priceMax, kampus, city].filter(Boolean).length
  const isFiltered = Boolean(q) || activeFilterCount > 0
  const priceMinNum = priceMin ? Number(priceMin) : null
  const priceMaxNum = priceMax ? Number(priceMax) : null
  const currentPage = Math.max(1, Number(page) || 1)

  const where: Prisma.KosWhereInput = {
    status: 'ACTIVE',
    // kos tanpa roomType aktif tidak punya cache harga sama sekali —
    // singkirkan dari listing publik, sama seperti perilaku lama
    // (allPrices.length === 0 → return null).
    priceMinCache: { not: null },
    ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }, { district: { contains: q, mode: 'insensitive' } }] } : {}),
    ...(kategori ? { segments: { some: { kosTypeId: kategori } } } : {}),
    ...(kampus ? { nearby: { some: { OR: (KAMPUS_POPULER.find((k) => k.label === kampus)?.aliases ?? [kampus]).map((alias) => ({ name: { contains: alias, mode: 'insensitive' as const } })) } } } : {}),
    // range overlap: kos ikut ditampilkan kalau rentang harganya
    // bersinggungan dengan rentang yang dicari user
    ...(priceMinNum != null ? { priceMaxCache: { gte: priceMinNum } } : {}),
    ...(priceMaxNum != null ? { priceMinCache: { lte: priceMaxNum } } : {}),
  }

  const [kosTypes, totalItems] = await Promise.all([
    prisma.kosType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.kos.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const kosListRaw = await prisma.kos.findMany({
    where,
    orderBy: { lastUpdatedAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      district: true,
      facilities: true,
      priceMinCache: true,
      priceMaxCache: true,
      lastUpdatedAt: true,
      segments: {
        take: 1,
        select: { kosType: { select: { name: true } } },
      },
      media: {
        orderBy: [{ isCover: 'desc' }, { order: 'asc' }],
        take: 1,
        select: { url: true },
      },
      nearby: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 1,
        select: { name: true, distanceText: true },
      },
    },
  })

  const now = Date.now()

  const kosList = kosListRaw.map((k) => ({
    id: k.id,
    slug: k.slug,
    name: k.name,
    city: k.city,
    district: k.district,
    facilities: k.facilities,
    priceMin: k.priceMinCache!,
    priceMax: k.priceMaxCache!,
    roomType: k.segments[0]?.kosType.name ?? null,
    imageUrl: k.media[0]?.url ? toPublicUrl(k.media[0].url) : null,
    nearbyText: k.nearby[0] ? `${k.nearby[0].distanceText} ke ${k.nearby[0].name}` : null,
    updatedDaysAgo: Math.floor((now - k.lastUpdatedAt.getTime()) / 86400000),
  }))

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-start gap-2">
          <div className="flex-1">
            <SearchForm defaultQuery={q} />
          </div>

          <FilterPanel q={q} kategori={kategori} priceMin={priceMin} priceMax={priceMax} activeFilterCount={activeFilterCount} kosTypes={kosTypes} />
        </div>

        {isFiltered && (
          <p className="mb-4 text-sm text-gray-500 md:text-base">
            {totalItems} kos ditemukan
            {q && (
              <>
                {' '}untuk <span className="font-medium text-gray-700">&ldquo;{q}&rdquo;</span>
              </>
            )}
            {city && (
              <>
                {' '}di <span className="font-medium text-gray-700">{city}</span>
              </>
            )}
            {kampus && (
              <>
                {' '}dekat <span className="font-medium text-gray-700">{kampus}</span>
              </>
            )}
          </p>
        )}

        {kosList.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ditemukan"
            description="Coba kata kunci atau filter lain, atau minta rekomendasi dari tim kami."
            actionLabel="Minta Rekomendasi"
            actionHref="/rekomendasi/mulai"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {kosList.map((kos) => (
                <KosCard
                  key={kos.id}
                  slug={kos.slug}
                  name={kos.name}
                  city={kos.city}
                  district={kos.district}
                  priceMonthly={kos.priceMin}
                  priceMax={kos.priceMax}
                  roomType={kos.roomType}
                  facilities={kos.facilities}
                  imageUrl={kos.imageUrl}
                  nearbyText={kos.nearbyText}
                  updatedDaysAgo={kos.updatedDaysAgo}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                buildHref={(p) => {
                  const params = new URLSearchParams()
                  if (q) params.set('q', q)
                  if (kategori) params.set('kategori', kategori)
                  if (priceMin) params.set('priceMin', priceMin)
                  if (priceMax) params.set('priceMax', priceMax)
                  if (kampus) params.set('kampus', kampus)
                  if (city) params.set('city', city)
                  if (p > 1) params.set('page', String(p))
                  const qs = params.toString()
                  return qs ? `/kos?${qs}` : '/kos'
                }}
              />
            )}
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}