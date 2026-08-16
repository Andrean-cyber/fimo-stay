import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { KosCard } from '@/components/kos-card'
import { SearchForm } from '@/app/(public)/kos/search-form'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  RefreshCw,
  Clock,
  Headphones,
  ArrowRight,
  MapPin,
  GraduationCap,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import type { Prisma } from '@prisma/client'
import { toPublicUrl } from '@/lib/r2'
import { KAMPUS_POPULER } from '@/lib/campuses'

export default async function HomePage() {
  const [kosRekomendasiRaw, kosAktifCities, kosTypes] = await Promise.all([
    prisma.kos.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { lastUpdatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        district: true,
        facilities: true,

        segments: {
          select: {
            kosType: {
              select: {
                name: true,
              },
            },
            roomTypes: {
              where: {
                isActive: true,
              },
              select: {
                priceMonthly: true,
              },
            },
          },
        },

        media: {
          orderBy: [
            { isCover: 'desc' },
            { order: 'asc' },
          ],
          take: 1,
          select: {
            url: true,
          },
        },

        nearby: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
          take: 1,
          select: {
            name: true,
            distanceText: true,
          },
        },
      },
    }),

    prisma.kos.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        city: true,
      },
    }),

    prisma.kosType.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  /*
   * Jenis kos dikelola oleh admin melalui KosType.
   * Filter menggunakan kosTypeId melalui relasi segments.
   */
  const KATEGORI: {
    label: string
    value: string
    filter: Prisma.KosWhereInput
  }[] = kosTypes.map((kt) => ({
    label: `Kos ${kt.name}`,
    value: kt.id,
    filter: {
      segments: {
        some: {
          kosTypeId: kt.id,
        },
      },
    },
  }))

  /*
   * Jumlah kos aktif per kategori.
   */
  const jumlahPerKategori = await Promise.all(
    KATEGORI.map((k) =>
      prisma.kos.count({
        where: {
          status: 'ACTIVE',
          ...k.filter,
        },
      })
    )
  )

  /*
   * Format data rekomendasi.
   */
  const kosRekomendasi = kosRekomendasiRaw.map((k) => {
    const allPrices = k.segments.flatMap((s) =>
      s.roomTypes.map((rt) => rt.priceMonthly)
    )

    const nearby = k.nearby[0]

    return {
      id: k.id,
      slug: k.slug,
      name: k.name,
      city: k.city,
      district: k.district,
      facilities: k.facilities,
      priceMonthly:
        allPrices.length > 0
          ? Math.min(...allPrices)
          : 0,
      roomType:
        k.segments[0]?.kosType.name ?? null,
      imageUrl:
        k.media[0]?.url
          ? toPublicUrl(k.media[0].url)
          : null,
      nearbyText:
        nearby
          ? `${nearby.distanceText} ke ${nearby.name}`
          : null,
    }
  })

  /*
   * Group kota secara case-insensitive.
   */
  const cityCountMap = new Map<
    string,
    {
      display: string
      count: number
    }
  >()

  for (const { city } of kosAktifCities) {
    const key = city.trim().toLowerCase()

    const existing = cityCountMap.get(key)

    if (existing) {
      existing.count++
    } else {
      cityCountMap.set(key, {
        display: city.trim(),
        count: 1,
      })
    }
  }

  const lokasiPopuler = Array.from(cityCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  /*
   * Total kos aktif.
   */
  const totalKosAktif = kosAktifCities.length

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="px-3 pt-3 sm:px-5 sm:pt-5">
          <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px]">

            <Image src="/hero-bali.webp" alt="Pemandangan Bali Indonesia" fill priority className="object-cover object-[65%_center]" sizes="100vw" />

            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-[400px] max-w-6xl flex-col px-4 pb-4 pt-8 sm:min-h-0 sm:block sm:px-8 sm:pb-8 sm:pt-24 lg:px-12 lg:pb-10 lg:pt-24 xl:px-14">

              <div className="flex flex-1 flex-col items-start justify-end sm:flex-none sm:justify-start">

                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-fimo-navy shadow-sm backdrop-blur-md sm:mb-5 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-fimo-blue sm:h-4 sm:w-4" />
                  <span>Kos pilihan yang selalu diperbarui</span>
                </div>

                <h1 className="max-w-[720px] text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-3xl sm:leading-[1.05] sm:tracking-[-0.03em] md:text-4xl lg:text-5xl xl:text-6xl">
                  Temukan Kos yang
                  <br />
                  <span className="text-sky-300">Tepat untukmu.</span>
                </h1>

                <p className="mt-2 line-clamp-2 max-w-[600px] text-[12px] leading-[18px] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)] sm:mt-5 sm:line-clamp-none sm:text-base sm:leading-7 lg:text-lg">
                  Cari kos yang masih tersedia, lokasi yang sesuai, dan harga yang cocok dengan kebutuhanmu. Semua lebih mudah dalam satu tempat.
                </p>

                <div className="hidden sm:mt-6 sm:flex sm:flex-wrap sm:gap-2.5">
                  <HeroBadge icon={CheckCircle2} text="Data kos aktif" />
                  <HeroBadge icon={ShieldCheck} text="Diverifikasi tim" />
                  <HeroBadge icon={RefreshCw} text="Update rutin" />
                </div>

              </div>

              <div className="relative z-30 mt-4 w-full sm:mt-6 lg:mt-10">
                <div className="rounded-2xl border border-white/50 bg-white/40 p-2.5 shadow-[0_15px_45px_rgba(15,23,42,0.15)] backdrop-blur-xl sm:rounded-2xl sm:p-4">

                  <div className="mb-2 flex items-center justify-between px-1 sm:mb-3 sm:px-2">
                    <div>
                      <p className="text-[13px] font-bold text-fimo-navy sm:text-base">Cari kos impianmu</p>
                      <p className="mt-0.5 text-[10px] text-white sm:text-xs">Pilih lokasi, kampus, atau kebutuhanmu</p>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-fimo-navy sm:flex">
                      <Search className="h-3.5 w-3.5" />
                      Cari sekarang
                    </div>
                  </div>

                  <SearchForm />

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            QUICK BENEFITS
        ========================================================= */}
        <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:py-14">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-5">

            <BenefitCard
              icon={ShieldCheck}
              title="Sudah Dicek Tim"
              description="Kos yang tampil telah melalui proses pengecekan sebelum dipublikasikan."
            />

            <BenefitCard
              icon={RefreshCw}
              title="Data Lebih Fresh"
              description="Informasi kos diperbarui secara rutin agar kamu tidak membuang waktu."
            />

            <BenefitCard
              icon={Headphones}
              title="Bingung Memilih?"
              description="Minta rekomendasi kos yang sesuai dengan kebutuhanmu."
            />

          </div>
        </section>

        {/* =========================================================
            KATEGORI
        ========================================================= */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-3 flex items-end justify-between sm:mb-5">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">
                Temukan yang sesuai
              </p>

              <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">
                Pilih Jenis Kos
              </h2>
            </div>

            <Link href="/kos" className="hidden items-center gap-1 text-sm font-semibold text-fimo-navy hover:text-fimo-blue sm:flex">
              Lihat semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {KATEGORI.map((k, i) => (
              <Link key={k.value} href={`/kos?kategori=${encodeURIComponent(k.value)}`} className="group rounded-lg border border-fimo-gray bg-white p-2.5 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-lg sm:rounded-2xl sm:p-5">

                {/* MOBILE: layout ringkas, icon + label sejajar */}
                <div className="flex items-center gap-2.5 sm:hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fimo-blue/10 text-fimo-navy">
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="truncate text-[12.5px] font-semibold text-gray-800 group-hover:text-fimo-navy">
                        {k.label}
                      </p>
                      <span className="shrink-0 rounded-full bg-fimo-gray px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                        {jumlahPerKategori[i]}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-500">
                      Lihat kos tersedia
                    </p>
                  </div>
                </div>

                {/* DESKTOP: layout asli, icon di atas, label di bawah */}
                <div className="hidden sm:block">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fimo-blue/10 text-fimo-navy">
                      <Search className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-fimo-gray px-2.5 py-1 text-xs font-medium text-gray-500">
                      {jumlahPerKategori[i]}
                    </span>
                  </div>
                  <p className="mt-4 text-base font-semibold text-gray-800 group-hover:text-fimo-navy">
                    {k.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Lihat kos tersedia
                  </p>
                </div>

              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================
            LOKASI POPULER
        ========================================================= */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 flex items-end justify-between sm:mb-5">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">
                Jelajahi lokasi
              </p>

              <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">
                Lokasi Populer
              </h2>
            </div>

            <Link href="/kos" className="flex items-center gap-1 text-xs font-semibold text-fimo-navy hover:text-fimo-blue sm:text-sm">
              Lihat semua
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {lokasiPopuler.map((l) => (
              <Link key={l.display} href={`/kos?city=${encodeURIComponent(l.display)}`} className="group flex items-center gap-1.5 rounded-full border border-fimo-gray bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-fimo-blue hover:bg-fimo-blue/5 hover:text-fimo-navy sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
                <MapPin className="h-3.5 w-3.5 text-fimo-blue sm:h-4 sm:w-4" />

                {l.display}

                <span className="text-[10px] text-gray-400 sm:text-xs">
                  {l.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================
            KAMPUS
        ========================================================= */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 sm:mb-5">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">
              Untuk mahasiswa
            </p>

            <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">
              Dekat Kampus Populer
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            {KAMPUS_POPULER.map((k) => (
              <Link key={k.label} href={`/kos?kampus=${encodeURIComponent(k.label)}`} className="group flex items-center gap-2.5 rounded-xl border border-fimo-gray bg-white p-3 transition hover:-translate-y-1 hover:border-fimo-blue/30 hover:shadow-md sm:gap-3 sm:rounded-2xl sm:p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fimo-navy/5 text-fimo-navy transition group-hover:bg-fimo-blue/10 sm:h-10 sm:w-10 sm:rounded-xl">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <span className="text-[12px] font-semibold text-gray-700 sm:text-sm">
                  {k.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================
            REKOMENDASI
        ========================================================= */}
        <section className="mx-auto max-w-6xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-20">
          <div className="mb-3 flex items-end justify-between sm:mb-5">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">
                Pilihan terbaru
              </p>

              <h2 className="text-lg font-bold text-fimo-navy sm:text-2xl sm:text-3xl">
                Rekomendasi Kos
              </h2>
            </div>

            <Link href="/kos" className="flex items-center gap-1 text-xs font-semibold text-fimo-navy hover:text-fimo-blue sm:text-sm">
              Lihat semua
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {kosRekomendasi.map((k) => (
              <KosCard
                key={k.id}
                slug={k.slug}
                name={k.name}
                city={k.city}
                district={k.district}
                priceMonthly={k.priceMonthly}
                roomType={k.roomType}
                facilities={k.facilities}
                imageUrl={k.imageUrl}
                nearbyText={k.nearbyText}
              />
            ))}
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================= */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-fimo-navy px-5 py-8 sm:rounded-[28px] sm:px-10 sm:py-12 lg:px-14">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fimo-blue/20 blur-3xl" />

            <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center md:gap-8">

              <div className="max-w-2xl">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-2 sm:text-xs sm:tracking-[0.18em]">
                  Jangan buang waktu
                </p>

                <h2 className="text-xl font-bold leading-tight text-white sm:text-3xl sm:text-4xl">
                  Capek keliling cari kos?
                  <br />
                  <span className="text-fimo-blue">
                    Biar FimoStay yang bantu.
                  </span>
                </h2>

                <p className="mt-2.5 max-w-xl text-[13px] leading-5 text-white/65 sm:mt-4 sm:text-base sm:leading-6">
                  Cari berdasarkan lokasi, kampus, jenis kos, dan kebutuhanmu. Temukan pilihan yang lebih relevan tanpa harus survey satu per satu.
                </p>
              </div>

              <Link href="/kos" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-fimo-navy transition hover:-translate-y-0.5 hover:bg-gray-100 sm:px-6 sm:py-3.5 sm:text-sm">
                Cari Kos Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

/* ===============================================================
   HERO BADGE
=============================================================== */

function HeroBadge({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-md">
      <Icon className="h-4 w-4 text-fimo-blue" />
      {text}
    </div>
  )
}

/* ===============================================================
   BENEFIT CARD
=============================================================== */

function BenefitCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-fimo-gray bg-white p-4 transition hover:border-fimo-blue/20 hover:shadow-sm sm:gap-4 sm:rounded-2xl sm:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fimo-blue/10 text-fimo-navy sm:h-11 sm:w-11 sm:rounded-xl">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
          {title}
        </h3>

        <p className="mt-0.5 text-[12px] leading-4 text-gray-500 sm:mt-1 sm:text-sm sm:leading-5">
          {description}
        </p>
      </div>
    </div>
  )
}
