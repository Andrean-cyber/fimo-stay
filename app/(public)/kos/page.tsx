import { PublicHeader } from '@/components/public-header'
import { SearchForm } from './search-form'
import { FilterPanel } from './filter-panel'
import { EmptyState } from '@/components/empty-state'
import { SearchX } from 'lucide-react'
import { KosCard } from '@/components/kos-card'
import { Pagination } from '@/components/pagination'
import { PublicFooter } from '@/components/public-footer'
import { KAMPUS_POPULER } from '@/lib/campuses'
import { kosIndex, type KosDocument } from '@/lib/meilisearch'
import { redis } from '@/lib/redis'
import { getSearchVersion, getKosTypes } from '@/lib/kos-cache'

const PAGE_SIZE = 20
const SEARCH_TTL = 45 // detik

type KosListItem = {
  id: string
  slug: string
  name: string
  city: string
  district: string | null
  facilities: string[]
  priceMin: number
  priceMax: number
  roomType: string | null
  imageUrl: string | null
  nearbyText: string | null
  updatedDaysAgo: number
}

// Meilisearch filter string pakai tanda kutip literal — value dari user
// (city, kategori, kampus) wajib di-escape supaya tidak merusak sintaks filter
// atau jadi celah injection.
function escapeMeiliValue(value: string) {
  return value.replace(/"/g, '\\"')
}

function buildMeiliFilter({
  kategori, priceMinNum, priceMaxNum, kampus, city,
}: {
  kategori: string
  priceMinNum: number | null
  priceMaxNum: number | null
  kampus: string
  city: string
}) {
  const filters: string[] = ['status = "ACTIVE"']

  if (city) filters.push(`city = "${escapeMeiliValue(city)}"`)
  if (kategori) filters.push(`kosTypeIds = "${escapeMeiliValue(kategori)}"`)

  // range overlap, setara logic Prisma sebelumnya:
  // priceMaxCache >= priceMin DAN priceMinCache <= priceMax
  if (priceMinNum != null) filters.push(`priceMax >= ${priceMinNum}`)
  if (priceMaxNum != null) filters.push(`priceMin <= ${priceMaxNum}`)

  if (kampus) {
    const aliases = KAMPUS_POPULER.find((k) => k.label === kampus)?.aliases ?? [kampus]
    const campusOr = aliases.map((alias) => `campusNames = "${escapeMeiliValue(alias)}"`).join(' OR ')
    filters.push(`(${campusOr})`)
  }

  return filters.join(' AND ')
}

// Nama diganti jadi searchKosResults supaya tidak bentrok dengan
// searchKos() yang sudah diekspor dari lib/meilisearch.ts
async function searchKosResults({
  q, kategori, priceMinNum, priceMaxNum, kampus, city, page,
}: {
  q: string
  kategori: string
  priceMinNum: number | null
  priceMaxNum: number | null
  kampus: string
  city: string
  page: number
}) {
  const filter = buildMeiliFilter({ kategori, priceMinNum, priceMaxNum, kampus, city })

  const result = await kosIndex.search<KosDocument>(q, {
    filter,
    sort: ['lastUpdatedAt:desc'],
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  return {
    hits: result.hits,
    // Meilisearch pakai estimasi kecuali exhaustiveNbHits diaktifkan;
    // cukup akurat untuk pagination di skala kos-mu sekarang
    totalItems: result.estimatedTotalHits,
  }
}

export default async function KosSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; priceMin?: string; priceMax?: string; kampus?: string; city?: string; page?: string }>
}) {
  const { q = '', kategori = '', priceMin = '', priceMax = '', kampus = '', city = '', page = '1' } = await searchParams
  const activeFilterCount = [kategori, priceMin, priceMax, kampus, city].filter(Boolean).length
  const isFiltered = Boolean(q) || activeFilterCount > 0
  const priceMinNum = priceMin ? Number(priceMin) : null
  const priceMaxNum = priceMax ? Number(priceMax) : null
  const currentPage = Math.max(1, Number(page) || 1)

  const version = await getSearchVersion()
  const cacheKey = `search:v${version}:${JSON.stringify({ q, kategori, priceMin, priceMax, kampus, city, page: currentPage })}`

  type CachedPayload = {
    kosList: KosListItem[]
    totalItems: number
    totalPages: number
    safePage: number
  }

  let payload = await redis.get<CachedPayload>(cacheKey)

  if (!payload) {
    const { hits, totalItems } = await searchKosResults({ q, kategori, priceMinNum, priceMaxNum, kampus, city, page: currentPage })
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)

    const kosList: KosListItem[] = hits.map((k) => ({
      id: k.id,
      slug: k.slug,
      name: k.name,
      city: k.city,
      district: k.district,
      facilities: k.facilities,
      priceMin: k.priceMin,
      priceMax: k.priceMax,
      roomType: k.kosTypeNames[0] ?? null,
      imageUrl: k.imageUrl,
      nearbyText: k.nearbyText,
      updatedDaysAgo: Math.floor((Date.now() - k.lastUpdatedAt) / 86400000),
    }))

    payload = { kosList, totalItems, totalPages, safePage }
    await redis.set(cacheKey, payload, { ex: SEARCH_TTL })
  }

  const { kosList, totalItems, totalPages, safePage } = payload
  const kosTypes = await getKosTypes()

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