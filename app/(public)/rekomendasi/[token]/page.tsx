import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    <div>
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-1">Rekomendasi Kos Untukmu</h1>
        <p className="text-gray-500 mb-6">Berdasarkan preferensi: {trx.preferenceNotes}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trx.recommendationItems.map((item) => (
            <Link
              key={item.id}
              href={`/kos/${item.kos.slug}`}
              className="border rounded p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold">{item.kos.name}</h2>
              <p className="text-sm text-gray-500">{item.kos.city}</p>
              <p className="text-sm mt-1">Rp{item.kos.priceMonthly.toLocaleString('id-ID')} / bulan</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}