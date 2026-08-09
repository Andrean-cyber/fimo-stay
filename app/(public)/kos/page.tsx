import Link from 'next/link'
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
    <div>
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <SearchForm defaultQuery={q} />
        </div>

        <p className="text-sm text-gray-500 mb-4">{results.estimatedTotalHits} kos ditemukan</p>

        {hits.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ditemukan"
            description="Coba kata kunci lain, atau minta rekomendasi dari tim kami."
            actionLabel="Minta Rekomendasi"
            actionHref="/rekomendasi/mulai"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hits.map((kos) => (
              <Link
                key={kos.id}
                href={`/kos/${kos.slug}`}
                className="border rounded overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <h2 className="font-semibold">{kos.name}</h2>
                  <p className="text-sm text-gray-500">{kos.city}</p>
                  <p className="text-sm mt-2">Rp{kos.priceMonthly.toLocaleString('id-ID')} / bulan</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}