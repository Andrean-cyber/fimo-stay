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

export default async function KosSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; kategori?: string; priceMin?: string; priceMax?: string; kampus?: string; page?: string }> }) {
  const { q = '', kategori = '', priceMin = '', priceMax = '', kampus = '', page = '1' } = await searchParams
  const activeFilterCount = [kategori, priceMin, priceMax, kampus].filter(Boolean).length
  const isFiltered = Boolean(q) || activeFilterCount > 0
  const priceMinNum = priceMin ? Number(priceMin) : null
  const priceMaxNum = priceMax ? Number(priceMax) : null
  const currentPage = Math.max(1, Number(page) || 1)

  const where: Prisma.KosWhereInput = {
    status: 'ACTIVE',
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }, { district: { contains: q, mode: 'insensitive' } }] } : {}),
    ...(kategori ? { segments: { some: { kosTypeId: kategori } } } : {}),
    ...(kampus ? { nearby: { some: { OR: (KAMPUS_POPULER.find((k) => k.label === kampus)?.aliases ?? [kampus]).map((alias) => ({ name: { contains: alias, mode: 'insensitive' as const } })) } } } : {}),
  }

  const kosTypes = await prisma.kosType.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  const kosListRaw = await prisma.kos.findMany({
    where,
    orderBy: { lastUpdatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      district: true,
      facilities: true,
      segments: {
        select: {
          kosType: { select: { name: true } },
          roomTypes: {
            where: { isActive: true },
            select: { priceMonthly: true },
          },
        },
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

  const kosListFiltered = kosListRaw
    .map((k) => {
      const allPrices = k.segments.flatMap((s) => s.roomTypes.map((rt) => rt.priceMonthly))
      if (allPrices.length === 0) return null

      const priceMinKos = Math.min(...allPrices)
      const priceMaxKos = Math.max(...allPrices)

      if (priceMinNum != null && priceMaxKos < priceMinNum) return null
      if (priceMaxNum != null && priceMinKos > priceMaxNum) return null

      const nearby = k.nearby[0]

      return {
        id: k.id,
        slug: k.slug,
        name: k.name,
        city: k.city,
        district: k.district,
        facilities: k.facilities,
        priceMin: priceMinKos,
        priceMax: priceMaxKos,
        roomType: k.segments[0]?.kosType.name ?? null,
        imageUrl: k.media[0]?.url ? toPublicUrl(k.media[0].url) : null,
        nearbyText: nearby ? `${nearby.distanceText} ke ${nearby.name}` : null,
      }
    })
    .filter((k): k is NonNullable<typeof k> => k !== null)

  const totalItems = kosListFiltered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * PAGE_SIZE
  const kosList = kosListFiltered.slice(startIdx, startIdx + PAGE_SIZE)

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