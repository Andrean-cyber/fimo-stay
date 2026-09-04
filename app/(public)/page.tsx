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
} from '@heroicons/react/24/outline'
import type { Prisma } from '@prisma/client'
import { toPublicUrl } from '@/lib/r2'
import { KAMPUS_POPULER } from '@/lib/campuses'
import { getCityImage } from '@/lib/city-images'

export default async function HomePage() {
  const [kosRekomendasiRaw, cityGroups, kosTypes] = await Promise.all([
    prisma.kos.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { lastUpdatedAt: 'desc' },
      take: 6,
      select: {
        id: true, slug: true, name: true, city: true, district: true, facilities: true,
        lastUpdatedAt: true,
        segments: { select: { kosType: { select: { name: true } }, roomTypes: { where: { isActive: true }, select: { priceMonthly: true } } } },
        media: { orderBy: [{ isCover: 'desc' }, { order: 'asc' }], take: 1, select: { url: true } },
        nearby: { where: { isActive: true }, orderBy: { order: 'asc' }, take: 1, select: { name: true, distanceText: true } },
      },
    }),
    prisma.kos.groupBy({
      by: ['city'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
    }),
    prisma.kosType.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const KATEGORI: { label: string; value: string; filter: Prisma.KosWhereInput }[] = kosTypes.map((kt) => ({
    label: `Kos ${kt.name}`,
    value: kt.id,
    filter: { segments: { some: { kosTypeId: kt.id } } },
  }))

  const now = Date.now()

  const kosRekomendasi = kosRekomendasiRaw.map((k) => {
    const allPrices = k.segments.flatMap((s) => s.roomTypes.map((rt) => rt.priceMonthly))
    const nearby = k.nearby[0]
    return {
      id: k.id, slug: k.slug, name: k.name, city: k.city, district: k.district, facilities: k.facilities,
      priceMonthly: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      roomType: k.segments[0]?.kosType.name ?? null,
      imageUrl: k.media[0]?.url ? toPublicUrl(k.media[0].url) : null,
      nearbyText: nearby ? `${nearby.distanceText} ke ${nearby.name}` : null,
      updatedDaysAgo: Math.floor((now - k.lastUpdatedAt.getTime()) / 86400000),
    }
  })

  const cityCountMap = new Map<string, { display: string; count: number }>()
  for (const { city, _count } of cityGroups) {
    const key = city.trim().toLowerCase()
    const existing = cityCountMap.get(key)
    if (existing) existing.count += _count._all
    else cityCountMap.set(key, { display: city.trim(), count: _count._all })
  }
  const lokasiPopuler = Array.from(cityCountMap.values()).sort((a, b) => b.count - a.count)

  return (
    // bg abu muda di mobile supaya card putih "mengambang" seperti referensi
    <div className="min-h-screen bg-slate-50 sm:bg-white">
      <PublicHeader />
      <main className="flex flex-col gap-5 pb-4 sm:gap-0 sm:pb-0">

        {/* ============ HERO ============ */}
        <section className="order-1">
          {/* --- MOBILE: tanpa foto, tanpa avatar/notif, langsung judul --- */}
          <div className="bg-white px-5 pb-6 pt-8 sm:hidden">
            <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-fimo-navy">
              Temukan Kos yang Nyaman,
              <br />
              Tepat untukmu.
            </h1>
            <p className="mt-3 text-[13px] leading-[1.6] text-slate-500">
              Cari kos yang masih tersedia, lokasi yang sesuai, dan harga yang cocok dengan kebutuhanmu.
            </p>
          </div>

          {/* --- DESKTOP: hero foto + floating search, tidak berubah --- */}
          <div className="relative hidden px-3 pt-3 sm:block sm:px-5 sm:pt-5">
            <div className="relative mx-auto max-w-[1400px]">
              <div className="relative h-[410px] overflow-hidden rounded-[28px] lg:h-[400px]">
                <Image src="/bg.webp" alt="Background hero" fill priority sizes="100vw" className="object-cover object-center" />
                <div className="relative z-10 flex h-full flex-col items-center justify-start px-10 pt-10 text-center lg:justify-center lg:pt-0 lg:pb-12">
                  <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-4 py-1.5 text-[11px] font-medium text-fimo-navy shadow-sm backdrop-blur-md">
                    <span>Kos pilihan yang selalu diperbarui</span>
                  </div>
                  <h1 className="font-display max-w-[680px] text-[38px] font-bold leading-[1.12] tracking-[-0.025em] text-fimo-navy md:text-[42px] lg:text-[46px]">
                    Temukan Kos yang Nyaman,
                    <br />
                    <span>Tepat untukmu.</span>
                  </h1>
                  <p className="mt-4 max-w-[520px] text-xs font-normal leading-[1.7] text-slate-700 md:text-sm">
                    Cari kos yang masih tersedia, lokasi yang sesuai, dan harga yang cocok dengan kebutuhanmu. Semua lebih mudah dalam satu tempat.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2.5">
                    <Link href="/kos" className="inline-flex h-10 items-center justify-center rounded-full bg-fimo-navy px-5 text-xs font-medium text-white shadow-sm transition-all hover:bg-fimo-navy/90 active:scale-[0.98]">
                      Cari Kos
                    </Link>
                    <Link href="/rekomendasi/mulai" className="inline-flex h-10 items-center justify-center rounded-full border border-fimo-navy/30 bg-white/70 px-5 text-xs font-medium text-fimo-navy backdrop-blur-sm transition-all hover:border-fimo-navy hover:bg-white active:scale-[0.98]">
                      Minta Rekomendasi
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative z-30 mx-auto -mt-9 w-[calc(100%-40px)] max-w-5xl lg:-mt-10">
                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)] lg:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3 px-2">
                    <div>
                      <p className="text-sm font-medium text-fimo-navy lg:text-base">Cari Kos Impianmu</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 lg:text-xs">Masukkan lokasi, kampus, atau alamat tujuanmu</p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-fimo-blue/10 px-3 py-1.5 text-xs font-medium text-fimo-navy sm:flex">
                      <MagnifyingGlassIcon className="h-3.5 w-3.5 text-fimo-blue" />
                      <span>Cari sekarang</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-2">
                    <SearchForm />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- MOBILE: search form dibungkus card putih rounded, langsung di bawah judul --- */}
          <div className="px-4 sm:hidden">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <SearchForm />
            </div>
          </div>
        </section>

        {/* ============ DEKAT KAMPUS POPULER ============ */}
        <section className="order-2 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
          {/* --- MOBILE: card putih, kategori jadi pill icon+label, geser ke kiri --- */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 mx-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:hidden">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue">Untuk mahasiswa</p>
            <h2 className="mb-3 text-base font-bold text-fimo-navy">Dekat Kampus Populer</h2>
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {KAMPUS_POPULER.map((k) => (
                <Link
                  key={k.label}
                  href={`/kos?kampus=${encodeURIComponent(k.label)}`}
                  className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/70 px-2 py-3 text-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition active:scale-[0.96] active:bg-slate-100"
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fimo-navy/5 text-fimo-navy">
                    {k.logoUrl ? <Image src={k.logoUrl} alt={k.label} fill className="object-contain p-2" sizes="44px" /> : <AcademicCapIcon className="h-5 w-5" />}
                  </div>
                  <span className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-gray-700">{k.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* --- DESKTOP: grid asli --- */}
          <div className="hidden sm:block">
            <div className="mb-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-fimo-blue">Untuk mahasiswa</p>
              <h2 className="text-2xl font-bold text-fimo-navy sm:text-3xl">Dekat Kampus Populer</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
              {KAMPUS_POPULER.map((k) => (
                <Link key={k.label} href={`/kos?kampus=${encodeURIComponent(k.label)}`} className="group flex items-center gap-3 rounded-2xl border border-fimo-gray bg-white p-4 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-md">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-fimo-navy/5 text-fimo-navy transition group-hover:bg-fimo-blue/10">
                    {k.logoUrl ? <Image src={k.logoUrl} alt={k.label} fill className="object-contain p-1.5" sizes="40px" /> : <AcademicCapIcon className="h-5 w-5" />}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{k.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA BANNER ============ */}
        <section className="order-3 sm:order-6 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20 sm:py-16 lg:py-24">
          <div className="relative mx-4 overflow-hidden rounded-2xl bg-fimo-navy px-5 py-6 sm:mx-0 sm:rounded-[28px] sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fimo-blue/20 blur-3xl sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />
            <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl sm:-bottom-20 sm:h-64 sm:w-64" />

            {/* ilustrasi PNG di kanan, seperti referensi */}
            <div className="pointer-events-none absolute -right-4 bottom-0 z-[5] h-32 w-32 opacity-95 sm:right-4 sm:h-44 sm:w-44 md:h-56 md:w-56">
              <Image
                src="/cta-illustration.webp"
                alt="Ilustrasi pencarian kos"
                fill
                className="object-contain object-bottom"
                sizes="(min-width: 768px) 220px, 128px"
              />
            </div>

            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="max-w-[65%] sm:max-w-2xl">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:text-xs sm:tracking-[0.18em]">Jangan buang waktu</p>
                <h2 className="text-lg font-bold leading-tight text-white sm:text-3xl sm:text-4xl">
                  Capek keliling cari kos?<br /><span className="text-fimo-blue">Biar FimoStay yang bantu.</span>
                </h2>
                <p className="mt-2 hidden text-white/65 sm:mt-4 sm:block sm:text-base sm:leading-6">
                  Cari berdasarkan lokasi, kampus, jenis kos, dan kebutuhanmu. Temukan pilihan yang lebih relevan tanpa harus survey satu per satu.
                </p>
              </div>
              <Link href="/kos" className="relative z-10 inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-fimo-navy transition hover:-translate-y-0.5 hover:bg-gray-100 sm:px-6 sm:py-3.5 sm:text-sm">
                Cari Kos Sekarang<ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============ REKOMENDASI KOS ============ */}
        <section className="order-4 sm:order-3 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 mx-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mx-0 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="mb-3 flex items-end justify-between sm:mb-5">
              <div>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Pilihan terbaru</p>
                <h2 className="text-base font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Rekomendasi Kos</h2>
              </div>
              <Link href="/kos" className="flex items-center gap-1 text-xs font-semibold text-fimo-navy hover:text-fimo-blue sm:text-sm">
                Lihat semua<ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {kosRekomendasi.map((k) => (
                <KosCard key={k.id} slug={k.slug} name={k.name} city={k.city} district={k.district} priceMonthly={k.priceMonthly} roomType={k.roomType} facilities={k.facilities} imageUrl={k.imageUrl} nearbyText={k.nearbyText} updatedDaysAgo={k.updatedDaysAgo} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ PILIH JENIS KOS ============ */}
        <section className="order-5 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 mx-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mx-0 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="mb-3 flex items-end justify-between sm:mb-5">
              <div>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Temukan yang sesuai</p>
                <h2 className="text-base font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Pilih Jenis Kos</h2>
              </div>
              <Link href="/kos" className="hidden items-center gap-1 text-sm font-semibold text-fimo-navy hover:text-fimo-blue sm:flex">
                Lihat semua<ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* --- MOBILE: pill icon+label, geser horizontal seperti kategori di referensi --- */}
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:hidden [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {KATEGORI.map((k) => (
                <Link
                  key={k.value}
                  href={`/kos?kategori=${encodeURIComponent(k.value)}`}
                  className="flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/70 px-2 py-3 text-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition active:scale-[0.96] active:bg-slate-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fimo-blue/10 text-fimo-navy">
                    <MagnifyingGlassIcon className="h-4.5 w-4.5" />
                  </div>
                  <span className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-gray-700">{k.label}</span>
                </Link>
              ))}
            </div>

            {/* --- DESKTOP: grid asli --- */}
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {KATEGORI.map((k) => (
                <Link key={k.value} href={`/kos?kategori=${encodeURIComponent(k.value)}`} className="group rounded-2xl border border-fimo-gray bg-white p-5 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fimo-blue/10 text-fimo-navy">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-gray-800 group-hover:text-fimo-navy">{k.label}</p>
                  <p className="mt-1 text-xs text-gray-500">Lihat kos tersedia</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

{/* ============ LOKASI POPULER ============ */}
<section className="order-6 sm:order-4 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 mx-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mx-0 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none">
    <div className="mb-3 sm:mb-5">
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">Jelajahi lokasi</p>
      <h2 className="text-base font-bold text-fimo-navy sm:text-2xl sm:text-3xl">Lokasi Populer</h2>
    </div>

    {/* mobile: geser horizontal | sm+: grid seperti semula */}
    <div
      className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      {lokasiPopuler.map((l) => {
        const imageUrl = getCityImage(l.display)
        return (
          <Link
            key={l.display}
            href={`/kos?city=${encodeURIComponent(l.display)}`}
            className="group relative aspect-square w-[104px] shrink-0 overflow-hidden rounded-lg border border-fimo-gray transition hover:-translate-y-1 hover:shadow-lg sm:w-auto sm:shrink sm:rounded-2xl"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={l.display}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 104px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-fimo-blue/10">
                <MapPinIcon className="h-5 w-5 text-fimo-blue/50 sm:h-9 sm:w-9" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 p-1.5 sm:p-3.5">
              <MapPinIcon className="h-3 w-3 shrink-0 text-white sm:h-4 sm:w-4" />
              <span className="truncate text-[10px] font-semibold text-white sm:text-sm">{l.display}</span>
            </div>
          </Link>
        )
      })}
    </div>
  </div>
</section>

        {/* ============ QUICK BENEFITS (desktop only) ============ */}
        <section className="order-7 hidden sm:block sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pb-10 lg:pb-14">
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