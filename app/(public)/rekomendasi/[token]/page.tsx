import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPinIcon, PhoneIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { toPublicUrl } from '@/lib/r2'
import { buildOwnerWhatsAppLink } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function RekomendasiPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const trx = await prisma.transaction.findUnique({
    where: { recommendationToken: token },
    include: {
      recommendationItems: {
        orderBy: { order: 'asc' },
        include: {
          kos: {
            include: {
              owner: true,
              media: { orderBy: [{ isCover: 'desc' }, { order: 'asc' }] },
              segments: {
                include: {
                  kosType: true,
                  roomTypes: { where: { isActive: true }, orderBy: { order: 'asc' } },
                },
              },
              nearby: { where: { isActive: true }, orderBy: { order: 'asc' } },
            },
          },
        },
      },
    },
  })

  // token tidak ditemukan / transaksi belum terverifikasi -> tidak boleh diakses
  if (!trx || trx.type !== 'RECOMMENDATION' || trx.status !== 'VERIFIED') notFound()

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="text-xl font-bold text-fimo-navy md:text-2xl">Rekomendasi Kos Untukmu</h1>
        {trx.preferenceNotes && (
          <p className="mb-6 mt-1 text-sm text-gray-500 md:text-base">
            Berdasarkan preferensi: {trx.preferenceNotes}
          </p>
        )}
        {!trx.preferenceNotes && <div className="mb-6" />}

        <div className="space-y-5">
          {trx.recommendationItems.map((item, i) => {
            const kos = item.kos
            const cover = kos.media[0]

            const allRoomTypes = kos.segments.flatMap((s) =>
              s.roomTypes.map((rt) => ({ ...rt, kosTypeName: s.kosType.name }))
            )
            const prices = allRoomTypes.map((rt) => rt.priceMonthly)
            const priceMin = prices.length > 0 ? Math.min(...prices) : 0
            const priceMax = prices.length > 0 ? Math.max(...prices) : 0

            // jaminan: kalau semua room type yang tercatat availableRooms-nya 0
            const hasAvailabilityData = allRoomTypes.some((rt) => rt.availableRooms != null)
            const isFull =
              hasAvailabilityData && allRoomTypes.every((rt) => (rt.availableRooms ?? 0) === 0)

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-fimo-gray bg-white shadow-sm"
              >
                <span className="absolute left-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-fimo-navy shadow-sm">
                  {i + 1}
                </span>

                <div className="relative aspect-[16/9] w-full bg-fimo-gray sm:aspect-[21/9]">
                  {cover ? (
                    <Image
                      src={toPublicUrl(cover.url)}
                      alt={kos.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      Belum ada foto
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-gray-900 md:text-lg">{kos.name}</h2>
                    {prices.length > 0 && (
                      <p className="text-base font-bold text-fimo-navy md:text-lg">
                        {priceMin === priceMax
                          ? `Rp${priceMin.toLocaleString('id-ID')}`
                          : `Mulai Rp${priceMin.toLocaleString('id-ID')}`}
                        <span className="text-xs font-normal text-gray-400 md:text-sm">/bulan</span>
                      </p>
                    )}
                  </div>

                  <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600 md:text-base">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    {kos.address}
                  </p>

                  {isFull && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700 md:text-sm">
                      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Kamar di kos ini sedang penuh. Tim kami menjamin akan mencarikan kos
                        pengganti tanpa biaya tambahan — hubungi kami via WhatsApp.
                      </span>
                    </div>
                  )}

                  {kos.facilities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {kos.facilities.map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-fimo-blue/10 px-2.5 py-1 text-xs text-fimo-navy md:text-sm"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {kos.nearby.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {kos.nearby.slice(0, 3).map((n) => (
                        <p key={n.id} className="text-xs text-gray-500 md:text-sm">
                          <span className="font-medium text-gray-700">{n.distanceText}</span> ke{' '}
                          {n.name}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="my-4 h-px bg-fimo-gray" />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 md:text-base">
                      <ShieldCheckIcon className="h-4 w-4 shrink-0 text-fimo-navy" />
                      Owner: <b>{kos.owner.name}</b>
                    </p>
                    <a
                      href={buildOwnerWhatsAppLink(kos.owner.phone, kos.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 md:text-base"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      Hubungi Owner
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
