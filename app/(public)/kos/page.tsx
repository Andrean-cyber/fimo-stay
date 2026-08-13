import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { PublicHeader } from '@/components/public-header'
import { SearchForm } from './search-form'
import { searchKos } from '@/lib/meilisearch'
import { EmptyState } from '@/components/empty-state'
import { SearchX } from 'lucide-react'

type KosHit = {
  id: string
  name: string
  slug: string
  city: string
  priceMonthly: number
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

        <p className="mb-4 text-sm text-gray-500">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {hits.map((kos) => (
              <Link
                key={kos.id}
                href={`/kos/${kos.slug}`}
                className="group overflow-hidden rounded-2xl border border-fimo-gray bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 group-hover:text-fimo-navy">
                    {kos.name}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {kos.city}
                  </p>
                  <p className="mt-3 text-base font-bold text-fimo-navy">
                    Rp{kos.priceMonthly.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-gray-500"> / bulan</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}