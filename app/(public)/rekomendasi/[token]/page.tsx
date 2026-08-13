import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'

export default async function RekomendasiPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const trx = await prisma.transaction.findUnique({
    where: { recommendationToken: token },
    include: { recommendationItems: { include: { kos: true }, orderBy: { order: 'asc' } } },
  })

  if (!trx || trx.status !== 'VERIFIED') notFound()

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold text-fimo-navy">Rekomendasi Kos Untukmu</h1>
        {trx.preferenceNotes && (
          <p className="mb-6 mt-1 text-sm text-gray-500">
            Berdasarkan preferensi: {trx.preferenceNotes}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trx.recommendationItems.map((item, i) => (
            <Link
              key={item.id}
              href={`/kos/${item.kos.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-fimo-gray bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-fimo-blue/15 text-xs font-semibold text-fimo-navy">
                {i + 1}
              </span>
              <h2 className="pr-8 font-semibold text-gray-900 group-hover:text-fimo-navy">
                {item.kos.name}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {item.kos.city}
              </p>
              <p className="mt-2 text-base font-bold text-fimo-navy">
                Rp{item.kos.priceMonthly.toLocaleString('id-ID')}
                <span className="text-xs font-normal text-gray-500"> / bulan</span>
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}