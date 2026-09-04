'use client'

import { useEffect, useRef, useState } from 'react'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { LegalPageLayout } from '@/components/legal-page-layout'
import {
  CircleStackIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

const SECTIONS = [
  { id: 'data', title: 'Data yang Dikumpulkan' },
  { id: 'penggunaan', title: 'Bagaimana Data Digunakan' },
  { id: 'tidak-dijual', title: 'Kami Tidak Menjual Data' },
  { id: 'keamanan', title: 'Keamanan Data' },
  { id: 'hak', title: 'Hak Kamu' },
]

/* ========================================
   REVEAL WRAPPER (scroll-triggered fade-up)
======================================== */

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`
        transform-gpu transition-all duration-700 ease-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default function KebijakanPrivasiPage() {
  // Fade-in saat halaman pertama dimuat (konsisten dengan Tentang & Syarat)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-950">
      <PublicHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-gray-200 bg-white">
          {/* Subtle background pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(#123B6D 0.7px, transparent 0.7px)',
              backgroundSize: '18px 18px',
              maskImage:
                'linear-gradient(to bottom, black, transparent 90%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
            <div
              className={`
                mx-auto max-w-3xl text-center
                transform-gpu transition-all duration-700 ease-out
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              {/* Badge */}
              <div
                style={{ transitionDelay: mounted ? '80ms' : '0ms' }}
                className={`
                  mb-4 inline-flex items-center gap-1.5 rounded-full border border-fimo-navy/15 bg-fimo-navy/[0.04] px-3 py-1.5 text-[11px] font-semibold text-fimo-navy sm:mb-5 sm:text-xs
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                `}
              >
                <LockClosedIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                PRIVASI &amp; KEAMANAN
              </div>

              {/* Title */}
              <h1
                style={{ transitionDelay: mounted ? '160ms' : '0ms' }}
                className={`
                  text-[30px]
                  font-bold
                  leading-[1.08]
                  tracking-[-0.03em]
                  text-fimo-navy
                  sm:text-[40px]
                  lg:text-[52px]
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
              >
                Kebijakan Privasi
              </h1>

              {/* Description */}
              <p
                style={{ transitionDelay: mounted ? '260ms' : '0ms' }}
                className={`
                  mx-auto
                  mt-4
                  max-w-2xl
                  text-[14px]
                  leading-6
                  text-gray-600
                  sm:mt-5
                  sm:text-base
                  sm:leading-7
                  lg:text-lg
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
              >
                Kami ingin kamu tahu bagaimana data digunakan ketika
                menggunakan FimoStay. Kami menjaga informasi yang kamu
                berikan tetap seperlunya dan transparan.
              </p>

              {/* Last updated */}
              <div
                style={{ transitionDelay: mounted ? '340ms' : '0ms' }}
                className={`
                  mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 sm:mt-6 sm:text-sm
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                `}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-fimo-navy" />

                <span>
                  Terakhir diperbarui{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LEGAL CONTENT */}
        <LegalPageLayout
          title=""
          lastUpdated=""
          sections={SECTIONS}
        >
          {/* ========================================
              01 — DATA YANG DIKUMPULKAN
          ======================================== */}
          <Reveal>
            <section
              id="data"
              className="scroll-mt-24 border-b border-gray-200 pb-10 sm:pb-12"
            >
              <SectionHeading
                number="01"
                icon={CircleStackIcon}
                title="Data yang Dikumpulkan"
              />

              <p>
                Untuk memproses permintaanmu, kami menyimpan nomor HP dan,
                jika kamu menggunakan layanan rekomendasi, preferensi kos
                yang kamu berikan.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  title="Yang kami simpan"
                  items={[
                    'Nomor HP',
                    'Preferensi kos',
                    'Informasi yang berkaitan dengan transaksi',
                  ]}
                />

                <InfoCard
                  title="Yang tidak kami minta"
                  items={[
                    'Email',
                    'KTP',
                    'Informasi keuangan sensitif',
                  ]}
                />
              </div>
            </section>
          </Reveal>

          {/* ========================================
              02 — BAGAIMANA DATA DIGUNAKAN
          ======================================== */}
          <Reveal>
            <section
              id="penggunaan"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="02"
                icon={EyeIcon}
                title="Bagaimana Data Digunakan"
              />

              <p>
                Informasi yang kamu berikan digunakan hanya untuk
                menjalankan layanan FimoStay dan membantu proses
                transaksimu.
              </p>

              <ul className="mt-6 space-y-3">
                <Bullet>
                  Menghubungkan kamu dengan pemilik kos yang kamu pilih
                  atau direkomendasikan.
                </Bullet>

                <Bullet>
                  Memverifikasi pembayaran yang kamu lakukan.
                </Bullet>

                <Bullet>
                  Mengirimkan informasi terkait transaksi melalui WhatsApp.
                </Bullet>
              </ul>
            </section>
          </Reveal>

          {/* ========================================
              03 — KAMI TIDAK MENJUAL DATA
          ======================================== */}
          <Reveal>
            <section
              id="tidak-dijual"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="03"
                icon={ShieldCheckIcon}
                title="Kami Tidak Menjual Data"
              />

              <div className="rounded-2xl border border-fimo-navy/10 bg-fimo-navy/[0.035] p-5 sm:p-6">
                <p className="text-gray-700">
                  Nomor HP dan preferensimu tidak pernah kami jual atau
                  bagikan untuk kepentingan pemasaran.
                </p>

                <p className="mt-4">
                  Data hanya dibagikan kepada pemilik kos yang relevan
                  dengan transaksi atau layanan yang kamu minta.
                </p>
              </div>
            </section>
          </Reveal>

          {/* ========================================
              04 — KEAMANAN DATA
          ======================================== */}
          <Reveal>
            <section
              id="keamanan"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="04"
                icon={LockClosedIcon}
                title="Keamanan Data"
              />

              <p>
                Data kamu disimpan di infrastruktur dengan kontrol akses
                yang ketat. Hanya tim internal yang berwenang yang dapat
                mengaksesnya, dan setiap perubahan tercatat dalam log
                audit internal.
              </p>

              <div className="mt-6 flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fimo-navy/[0.06] text-fimo-navy">
                  <LockClosedIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Akses terbatas
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Informasi hanya dapat diakses oleh pihak yang
                    membutuhkan data tersebut untuk menjalankan layanan.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          {/* ========================================
              05 — HAK KAMU
          ======================================== */}
          <Reveal>
            <section
              id="hak"
              className="scroll-mt-24 pt-10 sm:pt-12"
            >
              <SectionHeading
                number="05"
                icon={UserIcon}
                title="Hak Kamu"
              />

              <p>
                Kamu berhak mengetahui data yang kami simpan dan
                mengajukan permintaan penghapusan data, selama tidak
                bertentangan dengan kewajiban pencatatan transaksi yang
                masih berlaku.
              </p>

              {/* Contact CTA */}
              <div className="mt-6 rounded-2xl bg-fimo-navy p-5 text-white sm:p-6">
                <p className="text-sm font-semibold">
                  Punya pertanyaan tentang data kamu?
                </p>

                <p className="mt-1.5 text-xs leading-5 text-white/65 sm:text-sm">
                  Hubungi tim FimoStay jika kamu ingin menanyakan,
                  memperbarui, atau meminta penghapusan data.
                </p>

                <button
                  type="button"
                  className="
                    mt-4
                    rounded-xl
                    bg-white
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-fimo-navy
                    transition-transform
                    hover:-translate-y-0.5
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-fimo-navy
                    sm:text-sm
                  "
                >
                  Hubungi FimoStay
                </button>
              </div>
            </section>
          </Reveal>
        </LegalPageLayout>
      </main>

      <PublicFooter />
    </div>
  )
}

/* ========================================
   SECTION HEADING
======================================== */

function SectionHeading({
  number,
  icon: Icon,
  title,
}: {
  number: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
}) {
  return (
    <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fimo-navy text-white sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      {/* Title */}
      <div className="min-w-0">
        <span className="block text-[10px] font-bold tracking-[0.16em] text-gray-400 sm:text-xs">
          {number}
        </span>

        <h2 className="mt-0.5 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
          {title}
        </h2>
      </div>
    </div>
  )
}

/* ========================================
   BULLET
======================================== */

function Bullet({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-gray-600 sm:text-base">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fimo-navy" />

      <span>{children}</span>
    </li>
  )
}

/* ========================================
   INFO CARD
======================================== */

function InfoCard({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
        {title}
      </p>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-5 text-gray-700"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fimo-navy/50" />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}