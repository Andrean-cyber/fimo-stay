import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { KosCard } from '@/components/kos-card'
import { SearchForm } from '@/app/(public)/kos/search-form'
import { Reveal } from '@/components/reveal'
import { HomeFaq } from '@/components/home-faq'
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

const AVATAR_COUNT = 5

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
        <section className="order-1 sm:order-1">
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

          {/* --- DESKTOP + TABLET: split hero seperti referensi --- */}
          <div className="relative hidden px-3 pt-3 sm:block sm:px-5 sm:pt-5 lg:pt-6">
            <div className="mx-auto max-w-[1400px]">
              <div className="relative overflow-visible rounded-[30px] border border-slate-200/80 bg-[#f5f9fc] p-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-4 lg:p-5">
                <div className="grid min-h-[430px] grid-cols-2 overflow-hidden rounded-[24px] bg-[#f5f9fc] md:min-h-[455px] lg:min-h-[485px]">
                  <div className="flex flex-col justify-center px-6 py-10 sm:px-8 md:px-10 lg:px-14">
                    <div className="mb-5 w-fit rounded-full border border-fimo-navy/10 bg-white px-3.5 py-1.5 text-[10px] font-semibold tracking-wide text-fimo-navy shadow-sm md:text-[11px]">
                      Kos pilihan yang selalu diperbarui
                    </div>

                    <h1 className="font-display max-w-[620px] text-[28px] font-bold leading-[1.08] tracking-[-0.035em] text-fimo-navy md:text-[32px] lg:text-[42px]">
                      Temukan Kos yang Nyaman,
                      <br />
                      <span>Tepat untukmu.</span>
                    </h1>

                    <p className="mt-5 max-w-[500px] text-xs leading-[1.75] text-slate-600 md:text-sm lg:text-[15px]">
                      Cari kos yang masih tersedia, lokasi yang sesuai, dan harga yang cocok dengan kebutuhanmu. Semua lebih mudah dalam satu tempat.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-2.5">
                      <Link href="/kos" className="inline-flex h-10 items-center justify-center rounded-full bg-fimo-navy px-5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-fimo-navy/90 active:scale-[0.98]">
                        Cari Kos
                      </Link>
                      <Link href="/rekomendasi/mulai" className="inline-flex h-10 items-center justify-center rounded-full border border-fimo-navy/20 bg-white px-5 text-xs font-semibold text-fimo-navy transition hover:-translate-y-0.5 hover:border-fimo-navy/40 active:scale-[0.98]">
                        Minta Rekomendasi
                      </Link>
                    </div>

                    {/* Social proof avatar row, seperti referensi */}
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {Array.from({ length: AVATAR_COUNT }).map((_, i) => (
                          <div
                            key={i}
                            className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm md:h-10 md:w-10"
                          >
                            <Image
                              src={`/avatar-${i + 1}.webp`}
                              alt="Pengguna FimoStay"
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] font-medium leading-snug text-slate-500 md:text-xs">
                        Sudah dipakai ratusan pencari kos
                        <br className="hidden md:block" /> untuk temukan kos yang pas.
                      </p>
                    </div>
                  </div>

                  <div className="relative min-h-[390px] overflow-hidden rounded-[20px] md:min-h-[420px] lg:min-h-[445px]">
                    <Image
                      src="/fasad.webp"
                      alt="Pilihan kos FimoStay"
                      fill
                      priority
                      sizes="(min-width: 1024px) 50vw, 50vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/40 bg-white/85 p-4 shadow-lg backdrop-blur-md md:inset-x-6 md:bottom-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-fimo-navy/70">FimoStay</p>
                          <p className="mt-1 text-sm font-bold leading-tight text-fimo-navy md:text-base">Temukan tempat tinggal yang terasa tepat.</p>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fimo-navy text-white shadow-sm">
                          <ArrowRightIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search overlap — sengaja keluar sedikit dari hero seperti referensi */}
                <div className="relative z-30 mx-auto -mb-8 mt-5 w-[calc(100%-28px)] max-w-6xl sm:-mb-8 sm:mt-6">
                  <div className="rounded-[22px] bg-fimo-navy p-4 shadow-[0_22px_55px_rgba(15,23,42,0.20)] md:p-5 lg:p-6">
                    <div className="mb-3 flex items-center justify-between gap-3 px-1 md:px-2">
                      <div>
                        <p className="text-sm font-semibold text-white md:text-base">Cari Kos Impianmu</p>
                        <p className="mt-0.5 text-[10px] text-white/60 md:text-xs">Masukkan lokasi, kampus, atau alamat tujuanmu</p>
                      </div>
                      <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white sm:flex">
                        <MagnifyingGlassIcon className="h-3.5 w-3.5 text-fimo-blue" />
                        <span>Cari sekarang</span>
                      </div>
                    </div>

                    {/* Search container dibuat full-width dan padding-nya konsisten agar form benar-benar pas di dalam kotak putih. */}
                    <div className="w-full rounded-[18px] border border-white/80 bg-white p-2.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] md:p-3">
                      <SearchForm />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- MOBILE: search form dibungkus card putih rounded, langsung di bawah judul --- */}
          <div className="px-4 sm:hidden">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <SearchForm />
            </div>
          </div>
        </section>

        {/* ============ DEKAT KAMPUS POPULER ============ */}
        <section className="order-2 sm:order-2 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-16 lg:pt-20">
        <Reveal>
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
          </Reveal>
        </section>

        {/* ============ REKOMENDASI KOS ============ */}
        <section className="order-3 sm:order-3 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-24 lg:pt-28">
        <Reveal>
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
          </Reveal>
        </section>

        {/* ============ CTA / ABOUT ============ */}
        <section className="order-4 sm:order-4 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
        <Reveal>
          {/* MOBILE: pertahankan CTA lama */}
          <div className="relative mx-4 overflow-hidden rounded-2xl bg-fimo-navy px-5 py-6 sm:hidden">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fimo-blue/20 blur-3xl" />
            <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -right-4 bottom-0 z-[5] h-40 w-40 opacity-95">
              <Image src="/cta-illustration.webp" alt="Ilustrasi pencarian kos" fill className="object-contain object-bottom" sizes="128px" />
            </div>
            <div className="relative z-10 flex flex-col justify-between gap-4">
              <div className="max-w-[65%]">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue">Jangan buang waktu</p>
                <h2 className="text-lg font-bold leading-tight text-white">
                  Capek keliling cari kos?<br /><span className="text-fimo-blue">Biar FimoStay yang bantu.</span>
                </h2>
              </div>
              <Link href="/kos" className="relative z-10 inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-fimo-navy">
                Cari Kos Sekarang<ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* DESKTOP + TABLET: About + badge seperti referensi */}
          <div className="hidden overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.07)] sm:grid sm:grid-cols-2">
            <div className="relative min-h-[310px] overflow-hidden md:min-h-[350px]">
              <Image
                src="/cta-illustration.webp"
                alt="Ilustrasi FimoStay"
                fill
                className="object-cover object-center md:object-contain md:bg-slate-50"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute left-5 top-5 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md md:left-7 md:top-7">
                <p className="text-xl font-bold leading-none text-fimo-navy md:text-2xl">Lebih mudah.</p>
                <p className="mt-1 text-[10px] font-medium text-slate-500 md:text-xs">Lebih relevan untuk kebutuhanmu.</p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-7 py-8 md:px-10 lg:px-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fimo-blue md:text-xs">Tentang FimoStay</p>
              <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight tracking-[-0.025em] text-fimo-navy md:text-3xl lg:text-[34px]">
                Lebih dari sekadar mencari kos.
              </h2>
              <p className="mt-3 max-w-xl text-xs leading-6 text-slate-500 md:text-sm">
                Kami membantu kamu menemukan pilihan kos berdasarkan lokasi, kampus, jenis kos, dan kebutuhanmu tanpa harus survey satu per satu.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2.5 md:gap-3">
                <div className="rounded-2xl bg-slate-50 p-3 md:p-4">
                  <ShieldCheckIcon className="h-5 w-5 text-fimo-navy" />
                  <p className="mt-3 text-xs font-bold text-fimo-navy md:text-sm">Sudah dicek</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">Lebih yakin saat memilih.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 md:p-4">
                  <MapPinIcon className="h-5 w-5 text-fimo-navy" />
                  <p className="mt-3 text-xs font-bold text-fimo-navy md:text-sm">Dekat tujuan</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">Cari sesuai lokasi.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 md:p-4">
                  <ArrowPathIcon className="h-5 w-5 text-fimo-navy" />
                  <p className="mt-3 text-xs font-bold text-fimo-navy md:text-sm">Lebih fresh</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">Data diperbarui rutin.</p>
                </div>
              </div>

              <Link href="/rekomendasi/mulai" className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-fimo-navy px-5 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-fimo-navy/90">
                Kenali FimoStay<ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
         </Reveal>
        </section>

        {/* ============ QUICK BENEFITS / STATS BAR (desktop only) — dipindah tepat di bawah Tentang FimoStay ============ */}
        <section className="order-5 hidden sm:order-5 sm:block sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-6 lg:pt-8">
        <Reveal>
          <div className="overflow-hidden rounded-[24px] bg-fimo-navy px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.14)] md:px-6 md:py-5">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <BenefitStat icon={ShieldCheckIcon} title="Sudah Dicek" description="Sebelum dipublikasikan" />
              <BenefitStat icon={ArrowPathIcon} title="Data Fresh" description="Diperbarui rutin" />
              <BenefitStat icon={LifebuoyIcon} title="Bantuan Pilih" description="Rekomendasi sesuai kebutuhan" />
            </div>
          </div>
          </Reveal>
        </section>

        {/* ============ PILIH JENIS KOS ============ */}
        <section className="order-6 sm:order-6 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
        <Reveal>
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
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
              {KATEGORI.map((k) => (
                <Link
                  key={k.value}
                  href={`/kos?kategori=${encodeURIComponent(k.value)}`}
                  className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fimo-navy text-white transition group-hover:bg-fimo-blue">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-fimo-navy md:text-base">{k.label}</p>
                  <p className="mt-1 text-[11px] text-slate-500 md:text-xs">Lihat kos tersedia</p>
                  <ArrowRightIcon className="absolute right-4 top-5 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-fimo-blue" />
                </Link>
              ))}
            </div>
          </div>
         </Reveal>
        </section>

        {/* ============ LOKASI POPULER ============ */}
        <section className="order-7 sm:order-7 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
        <Reveal>
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
          </Reveal>
        </section>

        {/* ============ FAQ ============ */}
        <section className="order-8 sm:order-8 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:pt-14 lg:pt-20">
          <Reveal>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 mx-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:mx-0 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none">
              <HomeFaq />
            </div>
          </Reveal>
        </section>

      </main>
      <PublicFooter />
    </div>
  )
}

function BenefitStat({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 md:gap-3 md:px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white md:h-10 md:w-10">
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-white md:text-sm">{title}</p>
        <p className="mt-0.5 truncate text-[9px] text-white/55 md:text-[11px]">{description}</p>
      </div>
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
