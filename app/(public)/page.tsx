import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { KosCard } from '@/components/kos-card'
import { SearchForm } from '@/app/(public)/kos/search-form'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  LifebuoyIcon,
  ArrowRightIcon,
  MapPinIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import type { Prisma } from '@prisma/client'
import { toPublicUrl } from '@/lib/r2'
import { KAMPUS_POPULER } from '@/lib/campuses'
import { getCityImage } from '@/lib/city-images'

export default async function HomePage() {
  const [kosRekomendasiRaw, kosAktifCities, kosTypes] = await Promise.all([
    prisma.kos.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { lastUpdatedAt: 'desc' },
      take: 5,
      select: {
        id: true, slug: true, name: true, city: true, district: true, facilities: true,
        segments: { select: { kosType: { select: { name: true } }, roomTypes: { where: { isActive: true }, select: { priceMonthly: true } } } },
        media: { orderBy: [{ isCover: 'desc' }, { order: 'asc' }], take: 1, select: { url: true } },
        nearby: { where: { isActive: true }, orderBy: { order: 'asc' }, take: 1, select: { name: true, distanceText: true } },
      },
    }),
    prisma.kos.findMany({ where: { status: 'ACTIVE' }, select: { city: true } }),
    prisma.kosType.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  // Jenis kos dikelola admin lewat KosType, filter pakai kosTypeId via relasi segments.
  const KATEGORI: { label: string; value: string; filter: Prisma.KosWhereInput }[] = kosTypes.map((kt) => ({
    label: `Kos ${kt.name}`,
    value: kt.id,
    filter: { segments: { some: { kosTypeId: kt.id } } },
  }))

  // Format data rekomendasi.
  const kosRekomendasi = kosRekomendasiRaw.map((k) => {
    const allPrices = k.segments.flatMap((s) => s.roomTypes.map((rt) => rt.priceMonthly))
    const nearby = k.nearby[0]
    return {
      id: k.id, slug: k.slug, name: k.name, city: k.city, district: k.district, facilities: k.facilities,
      priceMonthly: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      roomType: k.segments[0]?.kosType.name ?? null,
      imageUrl: k.media[0]?.url ? toPublicUrl(k.media[0].url) : null,
      nearbyText: nearby ? `${nearby.distanceText} ke ${nearby.name}` : null,
    }
  })

  // Group kota case-insensitive. count dipakai untuk urutan popularitas, tidak ditampilkan ke publik.
  const cityCountMap = new Map<string, { display: string; count: number }>()
  for (const { city } of kosAktifCities) {
    const key = city.trim().toLowerCase()
    const existing = cityCountMap.get(key)
    if (existing) existing.count++
    else cityCountMap.set(key, { display: city.trim(), count: 1 })
  }
  const lokasiPopuler = Array.from(cityCountMap.values()).sort((a, b) => b.count - a.count).slice(0, 6)

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
{/* HERO */}
<section className="relative px-3 pt-3 sm:px-5 sm:pt-5">
  <div className="relative mx-auto max-w-[1400px]">
    {/* HERO BACKGROUND */}
    <div className="relative h-[355px] overflow-hidden rounded-[22px] sm:h-[410px] sm:rounded-[28px] lg:h-[400px]">
      <Image src="/bg.webp" alt="Background hero" fill priority sizes="100vw" className="object-cover object-center" />

      {/* HERO CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-start px-4 pt-6 text-center sm:px-10 sm:pt-10 lg:justify-center lg:pt-0 lg:pb-12">
        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[10px] font-medium text-fimo-navy shadow-sm backdrop-blur-md sm:mb-5 sm:px-4 sm:text-[11px]">
          <span>Kos pilihan yang selalu diperbarui</span>
        </div>

        {/* Heading */}
        <h1 className="font-display max-w-[680px] text-[28px] font-bold leading-[1.12] tracking-[-0.025em] text-fimo-navy sm:text-[38px] md:text-[42px] lg:text-[46px]">
          Temukan Kos yang Nyaman,
          <br />
          <span>Tepat untukmu.</span>
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-[520px] px-2 text-[11px] font-normal leading-[1.7] text-slate-700 sm:mt-4 sm:px-0 sm:text-xs md:text-sm">
          Cari kos yang masih tersedia, lokasi yang sesuai, dan harga yang cocok dengan kebutuhanmu. Semua lebih mudah dalam satu tempat.
        </p>

        {/* HERO ACTIONS */}
        <div className="mt-4 flex items-center justify-center gap-2 sm:mt-5 sm:gap-2.5">
          <Link href="/kos" className="inline-flex h-9 items-center justify-center rounded-full bg-fimo-navy px-4 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-fimo-navy/90 active:scale-[0.98] sm:h-10 sm:px-5 sm:text-xs">
            Cari Kos
          </Link>

          <Link href="/rekomendasi/mulai" className="inline-flex h-9 items-center justify-center rounded-full border border-fimo-navy/30 bg-white/70 px-4 text-[11px] font-medium text-fimo-navy backdrop-blur-sm transition-all hover:border-fimo-navy hover:bg-white active:scale-[0.98] sm:h-10 sm:px-5 sm:text-xs">
            Minta Rekomendasi
          </Link>
        </div>
      </div>
    </div>

    {/* FLOATING SEARCH */}
    <div className="relative z-30 mx-auto -mt-6 w-[calc(100%-24px)] max-w-5xl sm:-mt-9 sm:w-[calc(100%-40px)] lg:-mt-10">
      <div className="rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.12)] sm:rounded-[22px] sm:p-4 lg:p-5">
        {/* Search Header */}
        <div className="mb-2.5 flex items-center justify-between gap-3 px-1 sm:mb-4 sm:px-2">
          <div>
            <p className="text-[13px] font-medium text-fimo-navy sm:text-sm lg:text-base">
              Cari Kos Impianmu
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[11px] lg:text-xs">
              Masukkan lokasi, kampus, atau alamat tujuanmu
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-fimo-blue/10 px-3 py-1.5 text-[10px] font-medium text-fimo-navy sm:flex sm:text-xs">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 text-fimo-blue" />
            <span>Cari sekarang</span>
          </div>
        </div>

        {/* Search Form */}
        <div className="rounded-xl bg-slate-50 p-1.5 sm:rounded-2xl sm:p-2">
          <SearchForm />
        </div>
      </div>
    </div>
  </div>
</section>

        {/* DEKAT KAMPUS POPULER */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 sm:mb-5">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Untuk mahasiswa</p>
            <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Dekat Kampus Populer</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            {KAMPUS_POPULER.map((k) => (
              <Link key={k.label} href={`/kos?kampus=${encodeURIComponent(k.label)}`} className="group flex items-center gap-2.5 rounded-xl border border-fimo-gray bg-white p-3 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-md sm:gap-3 sm:rounded-2xl sm:p-4">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-fimo-navy/5 text-fimo-navy transition group-hover:bg-fimo-blue/10 sm:h-10 sm:w-10 sm:rounded-xl">
                  {k.logoUrl ? <Image src={k.logoUrl} alt={k.label} fill className="object-contain p-1.5" sizes="40px" /> : <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                </div>
                <span className="text-[12px] font-semibold text-gray-700 sm:text-sm">{k.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* REKOMENDASI KOS */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 flex items-end justify-between sm:mb-5">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Pilihan terbaru</p>
              <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Rekomendasi Kos</h2>
            </div>
            <Link href="/kos" className="flex items-center gap-1 text-xs font-semibold text-fimo-navy hover:text-fimo-blue sm:text-sm">
              Lihat semua<ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {kosRekomendasi.map((k) => (
              <KosCard key={k.id} slug={k.slug} name={k.name} city={k.city} district={k.district} priceMonthly={k.priceMonthly} roomType={k.roomType} facilities={k.facilities} imageUrl={k.imageUrl} nearbyText={k.nearbyText} />
            ))}
          </div>
        </section>

        {/* LOKASI POPULER */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 flex items-end justify-between sm:mb-5">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Jelajahi lokasi</p>
              <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Lokasi Populer</h2>
            </div>
            <Link href="/kos" className="flex items-center gap-1 text-xs font-semibold text-fimo-navy hover:text-fimo-blue sm:text-sm">
              Lihat semua<ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {lokasiPopuler.map((l) => {
              const imageUrl = getCityImage(l.display)
              return (
                <Link key={l.display} href={`/kos?city=${encodeURIComponent(l.display)}`} className="group relative aspect-square overflow-hidden rounded-xl border border-fimo-gray transition hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={l.display} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-fimo-blue/10">
                      <MapPinIcon className="h-7 w-7 text-fimo-blue/50 sm:h-9 sm:w-9" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 p-2.5 sm:p-3.5">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-white sm:h-4 sm:w-4" />
                    <span className="truncate text-xs font-semibold text-white sm:text-sm">{l.display}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* PILIH JENIS KOS */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 flex items-end justify-between sm:mb-5">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Temukan yang sesuai</p>
              <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Pilih Jenis Kos</h2>
            </div>
            <Link href="/kos" className="hidden items-center gap-1 text-sm font-semibold text-fimo-navy hover:text-fimo-blue sm:flex">
              Lihat semua<ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {KATEGORI.map((k) => (
              <Link key={k.value} href={`/kos?kategori=${encodeURIComponent(k.value)}`} className="group rounded-lg border border-fimo-gray bg-white p-2.5 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-lg sm:rounded-2xl sm:p-5">
                <div className="flex items-center gap-2.5 sm:hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fimo-blue/10 text-fimo-navy">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-gray-800 group-hover:text-fimo-navy">{k.label}</p>
                    <p className="text-[10.5px] text-gray-500">Lihat kos tersedia</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fimo-blue/10 text-fimo-navy">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-gray-800 group-hover:text-fimo-navy">{k.label}</p>
                  <p className="mt-1 text-xs text-gray-500">Lihat kos tersedia</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-fimo-navy px-5 py-8 sm:rounded-[28px] sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fimo-blue/20 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center md:gap-8">
              <div className="max-w-2xl">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-2 sm:text-xs sm:tracking-[0.18em]">Jangan buang waktu</p>
                <h2 className="text-xl font-bold leading-tight text-white sm:text-3xl sm:text-4xl">
                  Capek keliling cari kos?<br /><span className="text-fimo-blue">Biar FimoStay yang bantu.</span>
                </h2>
                <p className="mt-2.5 max-w-xl text-[13px] leading-5 text-white/65 sm:mt-4 sm:text-base sm:leading-6">
                  Cari berdasarkan lokasi, kampus, jenis kos, dan kebutuhanmu. Temukan pilihan yang lebih relevan tanpa harus survey satu per satu.
                </p>
              </div>
              <Link href="/kos" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-fimo-navy transition hover:-translate-y-0.5 hover:bg-gray-100 sm:px-6 sm:py-3.5 sm:text-sm">
                Cari Kos Sekarang<ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* QUICK BENEFITS */}
        <section className="mx-auto max-w-6xl px-4 pb-7 sm:px-6 sm:pb-10 lg:pb-14">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-5">
            <BenefitCard icon={ShieldCheckIcon} title="Sudah Dicek Tim" description="Kos yang tampil telah melalui proses pengecekan sebelum dipublikasikan." />
            <BenefitCard icon={ArrowPathIcon} title="Data Lebih Fresh" description="Informasi kos diperbarui secara rutin agar kamu tidak membuang waktu." />
            <BenefitCard icon={LifebuoyIcon} title="Bingung Memilih?" description="Minta rekomendasi kos yang sesuai dengan kebutuhanmu." />
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

function HeroBadge({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-md">
      <Icon className="h-4 w-4 text-fimo-blue" />
      {text}
    </div>
  )
}

function BenefitCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-fimo-gray bg-white p-4 transition hover:border-fimo-blue/20 hover:shadow-sm sm:gap-4 sm:rounded-2xl sm:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fimo-blue/10 text-fimo-navy sm:h-11 sm:w-11 sm:rounded-xl">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
        <p className="mt-0.5 text-[12px] leading-4 text-gray-500 sm:mt-1 sm:text-sm sm:leading-5">{description}</p>
      </div>
    </div>
  )
}
