import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { KosCard } from '@/components/kos-card'
import { SearchForm } from '@/app/(public)/kos/search-form'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Clock,
  Headphones,
  ArrowRight,
  MapPin,
  GraduationCap,
} from 'lucide-react'
import type { Prisma } from '@prisma/client'

// ⚠️ Filter kategori sekarang lewat relasi segments -> kosType,
// karena roomType/kosType bukan lagi field langsung di Kos.
// Pastikan value 'Putri' / 'Putra' / 'Campur' di bawah ini SAMA PERSIS
// (atau setidaknya cocok case-insensitive) dengan KosType.name di database.
const KATEGORI: { label: string; filter: Prisma.KosWhereInput }[] = [
  {
    label: 'Kos Putri',
    filter: { segments: { some: { kosType: { name: { equals: 'Putri', mode: 'insensitive' } } } } },
  },
  {
    label: 'Kos Putra',
    filter: { segments: { some: { kosType: { name: { equals: 'Putra', mode: 'insensitive' } } } } },
  },
  {
    label: 'Kos Campur',
    filter: { segments: { some: { kosType: { name: { equals: 'Campur', mode: 'insensitive' } } } } },
  },
  // ⚠️ ASUMSI: "Harian" & "Pet Friendly" ditandai lewat facilities, sesuaikan string-nya
  { label: 'Kos Harian', filter: { facilities: { has: 'Harian' } } },
  { label: 'Kos Pet Friendly', filter: { facilities: { has: 'Pet Friendly' } } },
]

// ⚠️ ASUMSI: belum ada model Campus, jadi kampus ditandai lewat tag di facilities
const KAMPUS_POPULER = ['UGM', 'ITB', 'UI', 'UB', 'ITS', 'UNDIP']

export default async function HomePage() {
  const [kosRekomendasiRaw, lokasiPopuler, jumlahPerKategori] = await Promise.all([
    prisma.kos.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { lastUpdatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
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
        media: {
          orderBy: [{ isCover: 'desc' }, { order: 'asc' }],
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.kos.groupBy({
      by: ['city'],
      where: { status: 'ACTIVE' },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 6,
    }),
    Promise.all(
      KATEGORI.map((k) =>
        prisma.kos.count({ where: { status: 'ACTIVE', ...k.filter } })
      )
    ),
  ])

  // Ringkas hasil query: priceMonthly diambil dari harga TERMURAH antar
  // semua roomType aktif kos tsb, roomType (label jenis kos) diambil dari
  // kosType segment pertama.
  const kosRekomendasi = kosRekomendasiRaw.map((k) => {
    const allPrices = k.segments.flatMap((s) => s.roomTypes.map((rt) => rt.priceMonthly))
    return {
      id: k.id,
      slug: k.slug,
      name: k.name,
      city: k.city,
      facilities: k.facilities,
      priceMonthly: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      roomType: k.segments[0]?.kosType.name ?? null,
      imageUrl: k.media[0]?.url,
    }
  })

  return (
    <div>
      <PublicHeader />

      {/* SEARCH BAR FULL WIDTH */}
      <section className="border-b border-fimo-gray bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 rounded-xl border border-fimo-gray p-3 md:flex-row md:items-center">
            <SearchForm />
            <div className="hidden shrink-0 items-center gap-6 border-l border-fimo-gray pl-6 text-xs text-gray-500 lg:flex lg:text-sm">
              <span>
                📅 Ketersediaan Kos
                <br />
                <b className="text-gray-700">Selalu Diperbarui Setiap Minggu</b>
              </span>
              <span>
                🛡️ 2 Hari Garansi
                <br />
                <b className="text-gray-700">Uang Kembali</b>
              </span>
              <span>
                🔒 Pembayaran Aman
                <br />
                <b className="text-gray-700">100% Terjamin</b>
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:space-y-16 sm:py-14">
        {/* SIDEBAR KATEGORI + HERO */}
        <section>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
            {/* SIDEBAR — desktop only */}
            <aside className="hidden rounded-2xl border border-fimo-gray bg-white p-4 lg:block">
              <h3 className="mb-3 px-2 text-sm font-semibold text-fimo-navy">KATEGORI</h3>
              <ul className="space-y-1">
                {KATEGORI.map((k, i) => (
                  <li key={k.label}>
                    <Link
                      href={`/kos?kategori=${encodeURIComponent(k.label)}`}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-fimo-navy/5 hover:text-fimo-navy"
                    >
                      <span>{k.label}</span>
                      <span className="text-xs text-gray-400">{jumlahPerKategori[i]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>

            {/* mobile kategori — horizontal scroll */}
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
              {KATEGORI.map((k) => (
                <Link
                  key={k.label}
                  href={`/kos?kategori=${encodeURIComponent(k.label)}`}
                  className="shrink-0 rounded-full border border-fimo-gray bg-white px-4 py-2 text-sm font-medium text-gray-600"
                >
                  {k.label}
                </Link>
              ))}
            </div>

            {/* HERO */}
            <div className="relative overflow-hidden rounded-2xl bg-fimo-navy/5">
              <div className="grid grid-cols-1 items-center gap-6 p-8 md:grid-cols-2 md:p-10 lg:p-12">
                <div>
                  <h1 className="text-3xl font-bold leading-[1.1] text-fimo-navy md:text-4xl lg:text-5xl">
                    Temukan
                    <br />
                    <span className="text-fimo-blue">Kos Nyaman,</span>
                    <br />
                    Dekat Kampus
                  </h1>
                  <p className="mt-3 text-sm text-gray-500 md:mt-4 md:text-base lg:max-w-sm">
                    Cari kos terbaik sesuai kebutuhanmu. Mudah, aman, dan terpercaya.
                  </p>
                  <Link
                    href="/kos"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-fimo-navy px-6 py-3 text-sm font-semibold text-white hover:bg-fimo-navy/90 md:px-8 md:py-3.5 md:text-base"
                  >
                    Cari Kos Sekarang
                  </Link>
                </div>
                <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl md:block">
                  <Image src="/hero.webp" alt="Kos FimoStay" fill priority className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOKASI POPULER */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fimo-navy md:text-xl">Lokasi Populer</h2>
            <Link href="/kos" className="text-sm font-medium text-fimo-navy hover:text-fimo-blue md:text-base">
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {lokasiPopuler.map((l) => (
              <Link
                key={l.city}
                href={`/kos?city=${encodeURIComponent(l.city)}`}
                className="flex items-center gap-1.5 rounded-full border border-fimo-gray bg-white px-4 py-2 text-sm text-gray-700 hover:border-fimo-blue md:text-base"
              >
                <MapPin className="h-3.5 w-3.5 text-fimo-blue" />
                {l.city}
              </Link>
            ))}
          </div>
        </section>

        {/* KAMPUS POPULER */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-fimo-navy md:text-xl">Dekat Kampus Populer</h2>
          <div className="flex flex-wrap gap-4">
            {KAMPUS_POPULER.map((kampus) => (
              <Link
                key={kampus}
                href={`/kos?facility=${encodeURIComponent(kampus)}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-fimo-gray bg-white px-5 py-4 hover:border-fimo-blue"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fimo-navy/5 text-fimo-navy">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-700 md:text-base">{kampus}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* REKOMENDASI KOS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fimo-navy md:text-xl">Rekomendasi Kos</h2>
            <Link href="/kos" className="text-sm font-medium text-fimo-navy hover:text-fimo-blue md:text-base">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kosRekomendasi.map((k) => (
              <KosCard
                key={k.id}
                slug={k.slug}
                name={k.name}
                city={k.city}
                priceMonthly={k.priceMonthly}
                roomType={k.roomType}
                facilities={k.facilities}
                imageUrl={k.imageUrl}
              />
            ))}
          </div>
        </section>

        {/* PROMO BANNER */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-center rounded-2xl bg-fimo-navy p-6 text-white md:col-span-1 md:p-8">
            <p className="text-lg font-bold md:text-xl">Booking Kos Sekarang Lebih Hemat!</p>
            <p className="mt-1 text-sm text-white/70 md:text-base">Diskon hingga 20% untuk booking 3 bulan ke atas.</p>
            <Link
              href="/promo"
              className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-fimo-blue px-4 py-2 text-sm font-medium text-fimo-navy md:text-base"
            >
              Lihat Promo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-fimo-gray bg-white p-6 sm:grid-cols-3 md:col-span-2 md:p-8">
            <Fitur icon={ShieldCheck} title="Aman & Terverifikasi" desc="Semua kos sudah diverifikasi tim kami" />
            <Fitur icon={Clock} title="Mudah & Cepat" desc="Cari, bandingkan, dan booking dalam hitungan menit" />
            <Fitur icon={Headphones} title="Dukungan 24/7" desc="Tim siap membantu kapan pun kamu butuh" />
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

function Fitur({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-fimo-navy/5 text-fimo-navy sm:mx-0">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-gray-800 md:text-base">{title}</p>
      <p className="mt-0.5 text-xs text-gray-500 md:text-sm">{desc}</p>
    </div>
  )
}
