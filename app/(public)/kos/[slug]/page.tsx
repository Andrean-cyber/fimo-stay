import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import {
  Car,
  Toilet,
  CookingPot,
  Wifi,
  Cctv,
  Shield,
  ShowerHead,
  Droplet,
  AirVent,
  Refrigerator,
  Shirt,
  BookOpen,
  Tv,
  Zap,
  WashingMachine,
  PawPrint,
  Dumbbell,
  Users,
  Coffee,
  ChartArea,
  Store,
  ChevronsUpDown,
  Volleyball,
  Sparkles,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { getKosDetailCached } from '@/lib/kos-detail-cache'
import { formatRpShort } from '@/lib/format-price'
import { PublicHeader } from '@/components/public-header'
import { SelfSearchForm } from './self-search-form'
import { PhotoGallery } from './photo-gallery'

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

const formatRp = (n: number) => `Rp${n.toLocaleString('id-ID')}`

// Tampilkan harga atau rentang harga. Tiap harga dibuat tidak boleh
// terputus di tengah (whitespace-nowrap), dan tanda "–" dilekatkan ke harga
// kedua. Kalau tempat sempit, baris pindah rapi:
//   Rp900.000
//   – Rp1.200.000
function PriceRange({ min, max }: { min: number; max: number }) {
  if (max <= min) return <span className="whitespace-nowrap">{formatRp(min)}</span>
  return (
    <>
      <span className="whitespace-nowrap">{formatRp(min)}</span>{' '}
      <span className="whitespace-nowrap">– {formatRp(max)}</span>
    </>
  )
}

// Versi responsif: format singkat ("Rp900rb – 1,2jt") di layar kecil, format
// lengkap ("Rp900.000 – Rp1.200.000") mulai breakpoint yang dipilih.
// Class Tailwind ditulis statis supaya tidak ter-purge.
const RESPONSIVE_CLASSES = {
  sm: { short: 'sm:hidden', full: 'hidden sm:inline' },
  md: { short: 'md:hidden', full: 'hidden md:inline' },
} as const

function PriceRangeResponsive({
  min,
  max,
  breakpoint = 'sm',
}: {
  min: number
  max: number
  breakpoint?: keyof typeof RESPONSIVE_CLASSES
}) {
  const cls = RESPONSIVE_CLASSES[breakpoint]
  const shortText = max > min ? `Rp${formatRpShort(min)} – ${formatRpShort(max)}` : `Rp${formatRpShort(min)}`
  return (
    <>
      <span className={`whitespace-nowrap ${cls.short}`}>{shortText}</span>
      <span className={cls.full}>
        <PriceRange min={min} max={max} />
      </span>
    </>
  )
}

// Pemetaan nama fasilitas (bebas teks dari admin) ke icon lucide-react yang
// masuk akal. Dicocokkan pakai keyword, case-insensitive, supaya tetap jalan
// walau nama fasilitas ditulis agak beda-beda oleh admin.
//
// Fasilitas yang sifatnya opsional/free (free listrik, free laundry, pet
// friendly, gym area, bisa berdua, cafe, communal area, mart, lift, area
// olahraga) cukup diisi admin di teks fasilitas — kalau tidak diisi, otomatis
// tidak muncul di halaman publik (list fasilitas hanya me-render apa yang ada).
const FACILITY_ICON_RULES: { keywords: string[]; icon: HeroIcon }[] = [
  // Fasilitas umum
  { keywords: ['parkir', 'parkiran'], icon: Car },
  { keywords: ['mandi', 'km dalam', 'km luar', 'toilet', 'wc'], icon: Toilet },
  { keywords: ['dapur'], icon: CookingPot },
  { keywords: ['wifi', 'internet'], icon: Wifi },
  { keywords: ['cctv', 'kamera'], icon: Cctv },
  { keywords: ['security', 'satpam'], icon: Shield },
  { keywords: ['water heater', 'pemanas air'], icon: ShowerHead },
  { keywords: ['dispenser'], icon: Droplet },

  // Fasilitas kamar
  { keywords: ['ac'], icon: AirVent },
  { keywords: ['kulkas', 'fridge'], icon: Refrigerator },
  { keywords: ['lemari', 'wardrobe', 'closet'], icon: Shirt },
  { keywords: ['meja'], icon: BookOpen },
  { keywords: ['tv', 'televisi'], icon: Tv },

  // Fasilitas tambahan/free (opsional, tampil hanya kalau diisi admin)
  { keywords: ['free listrik', 'listrik'], icon: Zap },
  { keywords: ['free laundry', 'laundry'], icon: WashingMachine },
  { keywords: ['pet friendly', 'pet'], icon: PawPrint },
  { keywords: ['gym'], icon: Dumbbell },
  { keywords: ['bisa berdua', 'berdua'], icon: Users },
  { keywords: ['cafe', 'kafe'], icon: Coffee },
  { keywords: ['communal area', 'communal'], icon: ChartArea },
  { keywords: ['mart'], icon: Store },
  { keywords: ['lift', 'elevator'], icon: ChevronsUpDown },
  { keywords: ['area olahraga', 'olahraga'], icon: Volleyball },
]

function getFacilityIcon(name: string): HeroIcon {
  const lower = name.toLowerCase()
  const match = FACILITY_ICON_RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw)))
  return match?.icon ?? Sparkles
}

export default async function KosDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Cek Redis dulu — kalau kos ini sedang trending/di halaman depan dan
  // diakses banyak pengunjung bersamaan, Supabase TIDAK perlu jalankan
  // query join berat (media + segments + roomTypes + nearby) berulang
  // kali. Status ACTIVE sudah dicek di dalam getKosDetailCached — kalau
  // kos tidak ACTIVE, fungsi ini return null (tidak pernah di-cache).
  const kos = await getKosDetailCached(slug)
  if (!kos) notFound()

  // Hanya tipe kamar aktif yang dihitung untuk harga.
  const allRoomTypes = kos.segments.flatMap((s) =>
    s.roomTypes
      .filter((rt) => rt.isActive)
      .map((rt) => ({ ...rt, kosTypeName: s.kosType.name, segmentName: s.name }))
  )
  const hasPrice = allRoomTypes.length > 0
  // harga terendah = MIN(priceMonthly); tertinggi = MAX(priceMaxMonthly ?? priceMonthly)
  const priceMin = hasPrice ? Math.min(...allRoomTypes.map((rt) => rt.priceMonthly)) : 0
  const priceMax = hasPrice
    ? Math.max(...allRoomTypes.map((rt) => rt.priceMaxMonthly ?? rt.priceMonthly))
    : 0
  const cheapestId = hasPrice
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
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke pencarian
        </Link>

        {/* Galeri foto — klik untuk preview fullscreen */}
        <PhotoGallery media={kos.media} name={kos.name} />

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* ===== Kolom konten utama ===== */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight text-fimo-navy sm:text-3xl">{kos.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 md:text-base">
              <MapPinIcon className="h-4 w-4 shrink-0" />
              {kos.district ? `${kos.district}, ${kos.city}` : kos.city}
            </p>

            {/* Harga: tampil di sini juga untuk mobile (sidebar tersembunyi di mobile) */}
            {hasPrice && (
              <p className="mt-4 text-xl font-bold leading-snug text-fimo-navy lg:hidden">
                <PriceRangeResponsive min={priceMin} max={priceMax} breakpoint="sm" />
                <span className="whitespace-nowrap text-sm font-normal text-gray-500"> / bulan</span>
              </p>
            )}

            {kos.description && (
              <>
                <div className="my-6 h-px bg-fimo-gray" />
                <h2 className="mb-3 text-base font-semibold text-gray-900 md:text-lg">Tentang Kos Ini</h2>
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
                                  {rt.id === cheapestId && allRoomTypes.length > 1 && priceMin !== priceMax && (
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
                                {rt.facilities.length > 0 && (
                                  <div className="mt-2">
                                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400 md:text-[11px]">
                                      Fasilitas kamar
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {rt.facilities.map((f) => {
                                        const Icon = getFacilityIcon(f)
                                        return (
                                          <span
                                            key={f}
                                            className="flex items-center gap-1 rounded-full border border-fimo-blue/20 bg-fimo-blue/5 px-2 py-0.5 text-[11px] text-fimo-navy md:text-xs"
                                          >
                                            <Icon className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                                            {f}
                                          </span>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="shrink-0 text-right text-sm font-semibold leading-snug text-fimo-navy md:text-base">
                                <PriceRangeResponsive
                                  min={rt.priceMonthly}
                                  max={rt.priceMaxMonthly ?? rt.priceMonthly}
                                  breakpoint="md"
                                />
                                <span className="block text-[11px] font-normal text-gray-400 md:text-xs">/bln</span>
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
                  {kos.facilities.map((f) => {
                    const Icon = getFacilityIcon(f)
                    return (
                      <span
                        key={f}
                        className="flex items-center gap-1.5 rounded-full bg-fimo-blue/10 px-3 py-1.5 text-sm text-fimo-navy md:text-base"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {f}
                      </span>
                    )
                  })}
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
                        <MapPinIcon className="h-4 w-4 text-fimo-blue" />
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
                <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-fimo-navy" />
                Kami bantu hubungkan kamu langsung dengan pemilik kos yang sudah terverifikasi tim kami.
              </p>
              <SelfSearchForm kosId={kos.id} />
            </div>
          </div>

          {/* ===== Sidebar harga & kontak — sticky di desktop ===== */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-fimo-gray bg-white p-5 shadow-sm">
                {hasPrice && (
                  <div>
                    <p className="text-xl font-bold leading-snug text-fimo-navy xl:text-2xl">
                      <PriceRange min={priceMin} max={priceMax} />
                    </p>
                    <p className="mt-1 text-sm text-gray-500">per bulan</p>
                  </div>
                )}

                <div className="my-4 h-px bg-fimo-gray" />

                <p className="mb-3 flex items-start gap-2 text-base text-gray-600">
                  <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-fimo-navy" />
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
