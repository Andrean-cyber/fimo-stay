import { PublicHeader } from '@/components/public-header'
import { SearchForm } from './search-form'
import { searchKos } from '@/lib/meilisearch'
import { EmptyState } from '@/components/empty-state'
import { SearchX } from 'lucide-react'
import { KosCard } from '@/components/kos-card'

type KosHit = {
  id: string
  name: string
  slug: string
  city: string
  priceMin: number
  priceMax: number
  coverImageUrl: string | null
  kosTypes?: string[]
  facilities?: string[]
}

export default async function KosSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = await searchKos(q)
  const hits = results.hits as KosHit[]

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <SearchForm defaultQuery={q} />
        </div>

        <p className="mb-4 text-sm text-gray-500 md:text-base">
          {results.estimatedTotalHits} kos ditemukan
          {q && (
            <>
              {' '}untuk <span className="font-medium text-gray-700">&ldquo;{q}&rdquo;</span>
            </>
          )}
        </p>

        {hits.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ditemukan"
            description="Coba kata kunci lain, atau minta rekomendasi dari tim kami."
            actionLabel="Minta Rekomendasi"
            actionHref="/rekomendasi/mulai"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {hits.map((kos) => (
              <KosCard
                key={kos.id}
                slug={kos.slug}
                name={kos.name}
                city={kos.city}
                priceMonthly={kos.priceMin}
                priceMax={kos.priceMax}
                roomType={kos.kosTypes?.[0]}
                facilities={kos.facilities}
                imageUrl={kos.coverImageUrl}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
