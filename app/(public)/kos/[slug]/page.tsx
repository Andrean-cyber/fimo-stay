import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { SelfSearchForm } from './self-search-form'

export default async function KosDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const kos = await prisma.kos.findUnique({
    where: { slug },
    include: { media: { orderBy: { order: 'asc' } } },
  })

  // sengaja cek status manual di sini — meskipun Prisma bypass RLS,
  // kos yang tidak ACTIVE tetap tidak boleh terlihat publik
  if (!kos || kos.status !== 'ACTIVE') notFound()

  return (
    <div>
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {kos.media.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {kos.media.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={m.url} alt={kos.name} className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        )}

        <h1 className="text-2xl font-semibold">{kos.name}</h1>
        <p className="text-gray-500">{kos.address}, {kos.city}</p>
        <p className="text-lg mt-2">Rp{kos.priceMonthly.toLocaleString('id-ID')} / bulan</p>

        {kos.description && <p className="mt-4 text-gray-700">{kos.description}</p>}

        {kos.facilities.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Fasilitas</h2>
            <div className="flex flex-wrap gap-2">
              {kos.facilities.map((f) => (
                <span key={f} className="text-sm bg-gray-100 px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}

<div className="mt-8 border-t pt-6">
  <p className="text-sm text-gray-500 mb-2">Kontak owner tersembunyi.</p>
  <SelfSearchForm kosId={kos.id} />
</div>
      </main>
    </div>
  )
}