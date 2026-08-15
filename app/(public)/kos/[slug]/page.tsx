import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { SelfSearchForm } from './self-search-form'
import { PhotoGallery } from './photo-gallery'

export default async function KosDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const kos = await prisma.kos.findUnique({
    where: { slug },
    include: {
      media: { orderBy: { order: 'asc' } },
      segments: {
        include: {
          kosType: true,
          roomTypes: { where: { isActive: true }, orderBy: { order: 'asc' } },
        },
      },
      nearby: { where: { isActive: true }, orderBy: { order: 'asc' } },
    },
  })

  // sengaja cek status manual di sini — meskipun Prisma bypass RLS,
  // kos yang tidak ACTIVE tetap tidak boleh terlihat publik
  if (!kos || kos.status !== 'ACTIVE') notFound()

  const allRoomTypes = kos.segments.flatMap((s) =>
    s.roomTypes.map((rt) => ({ ...rt, kosTypeName: s.kosType.name, segmentName: s.name }))
  )
  const allPrices = allRoomTypes.map((rt) => rt.priceMonthly)
  const priceMin = allPrices.length > 0 ? Math.min(...allPrices) : 0
  const priceMax = allPrices.length > 0 ? Math.max(...allPrices) : 0
  const cheapestId = allRoomTypes.length > 0
    ? allRoomTypes.reduce((a, b) => (a.priceMonthly <= b.priceMonthly ? a : b)).id
    : null

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Link
          href="/kos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-fimo-navy md:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke pencarian
        </Link>

        {/* Galeri foto — klik untuk preview fullscreen */}
        <PhotoGallery media={kos.media} name={kos.name} />

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* ===== Kolom konten utama ===== */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight text-fimo-navy sm:text-3xl">{kos.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 md:text-base">
              <MapPin className="h-4 w-4 shrink-0" />
              {kos.district ? `${kos.district}, ${kos.city}` : kos.city}
            </p>

            {/* Harga: tampil di sini juga untuk mobile (sidebar tersembunyi di mobile) */}
            {allPrices.length > 0 && (
              <p className="mt-4 text-xl font-bold text-fimo-navy lg:hidden">
                {priceMin === priceMax
                  ? `Rp${priceMin.toLocaleString('id-ID')}`
                  : `Mulai Rp${priceMin.toLocaleString('id-ID')}`}
                <span className="text-sm font-normal text-gray-500"> / bulan</span>
              </p>
            )}

            {kos.description && (
              <>
                <div className="my-6 h-px bg-fimo-gray" />
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base">
                  {kos.description}
                </p>
              </>
            )}

            {/* Daftar tipe kamar per segment */}
            {kos.segments.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-base font-semibold text-gray-900 md:text-lg">Pilihan Tipe Kamar</h2>
                <div className="space-y-5">
                  {kos.segments.map((segment) => (
                    <div key={segment.id}>
                      <p className="mb-2.5 text-sm font-medium text-fimo-navy md:text-base">
                        {segment.kosType.name}
                        {segment.name && <span className="text-gray-400"> — {segment.name}</span>}
                      </p>
                      <div className="space-y-2.5">
                        {segment.roomTypes
                          .filter((rt) => rt.isActive)
                          .map((rt) => (
                            <div
                              key={rt.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-fimo-gray p-3.5 transition-colors hover:border-fimo-blue/50 hover:bg-fimo-blue/5 md:p-4"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-gray-800 md:text-base">{rt.name}</p>
                                  {rt.id === cheapestId && priceMin !== priceMax && (
                                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700 md:text-[11px]">
                                      Termurah
                                    </span>
                                  )}
                                </div>
                                {rt.description && (
                                  <p className="mt-0.5 truncate text-xs text-gray-500 md:text-sm">{rt.description}</p>
                                )}
                                {rt.availableRooms != null && (
                                  <p className="mt-0.5 text-xs text-gray-400 md:text-sm">{rt.availableRooms} kamar tersedia</p>
                                )}
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-fimo-navy md:text-base">
                                Rp{rt.priceMonthly.toLocaleString('id-ID')}
                                <span className="block text-right text-[11px] font-normal text-gray-400 md:text-xs">/bln</span>
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kos.facilities.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-base font-semibold text-gray-900 md:text-lg">Fasilitas Umum</h2>
                <div className="flex flex-wrap gap-2">
                  {kos.facilities.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-fimo-blue/10 px-3 py-1.5 text-sm text-fimo-navy md:text-base"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {kos.nearby.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-base font-semibold text-gray-900 md:text-lg">Lokasi Terdekat</h2>
                <div className="space-y-2">
                  {kos.nearby.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center gap-3 rounded-xl border border-fimo-gray px-3.5 py-2.5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fimo-blue/10">
                        <MapPin className="h-4 w-4 text-fimo-blue" />
                      </span>
                      <p className="text-sm text-gray-600 md:text-base">
                        <span className="font-medium text-gray-800">{n.distanceText}</span> ke {n.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kontak — versi mobile, inline di bawah konten */}
            <div className="mt-8 rounded-2xl border border-fimo-gray bg-fimo-gray/30 p-5 lg:hidden">
              <p className="mb-3 flex items-start gap-2 text-sm text-gray-600 md:text-base">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fimo-navy" />
                Kontak owner tersembunyi. Buka kontak untuk melihat nomor dan menghubungi langsung.
              </p>
              <SelfSearchForm kosId={kos.id} />
            </div>
          </div>

          {/* ===== Sidebar harga & kontak — sticky di desktop ===== */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-fimo-gray bg-white p-5 shadow-sm">
                {allPrices.length > 0 && (
                  <p className="text-3xl font-bold text-fimo-navy">
                    {priceMin === priceMax
                      ? `Rp${priceMin.toLocaleString('id-ID')}`
                      : `Mulai Rp${priceMin.toLocaleString('id-ID')}`}
                    <span className="block text-base font-normal text-gray-500">per bulan</span>
                  </p>
                )}

                <div className="my-4 h-px bg-fimo-gray" />

                <p className="mb-3 flex items-start gap-2 text-base text-gray-600">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fimo-navy" />
                  Kontak owner tersembunyi. Buka kontak untuk melihat nomor dan menghubungi langsung.
                </p>
                <SelfSearchForm kosId={kos.id} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
