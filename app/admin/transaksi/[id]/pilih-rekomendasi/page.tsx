import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { RECOMMENDATION_KOS_COUNT } from '@/lib/constants'
import { PilihRekomendasiForm } from './pilih-rekomendasi-form'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default async function PilihRekomendasiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const trx = await prisma.transaction.findUnique({
    where: { id },
    include: { searcher: true, recommendationItems: true },
  })
  if (!trx) notFound()

  const kosAktifRaw = await prisma.kos.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      city: true,
      address: true,
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
    },
  })

  // Ringkas: priceMonthly ambil harga TERMURAH antar semua roomType aktif,
  // roomType (label jenis kos) ambil dari kosType segment pertama.
  const kosAktif = kosAktifRaw.map((k) => {
    const allPrices = k.segments.flatMap((s) => s.roomTypes.map((rt) => rt.priceMonthly))
    return {
      id: k.id,
      name: k.name,
      city: k.city,
      address: k.address,
      facilities: k.facilities,
      priceMonthly: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      roomType: k.segments[0]?.kosType.name ?? null,
    }
  })

  const alreadySelectedIds = trx.recommendationItems.map((r) => r.kosId)

  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <Link
        href="/admin/transaksi"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-fimo-navy lg:text-[15px]"
      >
        <ArrowLeftIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
        Kembali ke daftar transaksi
      </Link>

      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">
          Pilih {RECOMMENDATION_KOS_COUNT} Kos untuk Rekomendasi
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Untuk {trx.searcher.phone}
          {trx.preferenceNotes && (
            <>
              {' '}
              — preferensi: <span className="text-gray-700">{trx.preferenceNotes}</span>
            </>
          )}
        </p>
      </div>

      <PilihRekomendasiForm
        transactionId={trx.id}
        kosList={kosAktif}
        initialSelectedIds={alreadySelectedIds}
        requiredCount={RECOMMENDATION_KOS_COUNT}
      />
    </div>
  )
}
