'use client'

import { useEffect, useRef, useState } from 'react'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { LegalPageLayout } from '@/components/legal-page-layout'
import {
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const SECTIONS = [
  { id: 'layanan', title: '1. Layanan Kami' },
  { id: 'pembayaran', title: '2. Pembayaran' },
  { id: 'refund', title: '3. Kebijakan Refund' },
  { id: 'tanggung-jawab', title: '4. Tanggung Jawab Kami' },
  { id: 'kewajiban', title: '5. Kewajiban Pengguna' },
  { id: 'perubahan', title: '6. Perubahan Ketentuan' },
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

export default function SyaratPage() {
  // Fade-in saat halaman pertama dimuat (sama seperti halaman Tentang)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-950">
      <PublicHeader />

      <main>
        {/* ========================================
            HERO
        ======================================== */}
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
                <DocumentTextIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                INFORMASI LAYANAN
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
                Syarat &amp; Ketentuan
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
                Beberapa hal penting yang perlu kamu ketahui sebelum
                menggunakan layanan FimoStay.
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

        {/* ========================================
            LEGAL CONTENT
        ======================================== */}
        <LegalPageLayout
          title=""
          lastUpdated=""
          sections={SECTIONS}
        >
          {/* ========================================
              01 — LAYANAN KAMI
          ======================================== */}
          <Reveal>
            <section
              id="layanan"
              className="scroll-mt-24 border-b border-gray-200 pb-10 sm:pb-12"
            >
              <SectionHeading
                number="01"
                icon={ClipboardDocumentCheckIcon}
                title="Layanan Kami"
              />

              <p>
                FimoStay menyediakan dua layanan berbayar: membuka kontak
                pemilik kos untuk satu kos pilihanmu sendiri, dan
                rekomendasi 3 kos yang dipilihkan tim kami berdasarkan
                preferensi yang kamu berikan.
              </p>

              <div className="mt-6 rounded-2xl border border-fimo-navy/10 bg-fimo-navy/[0.035] p-5 sm:p-6">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fimo-navy text-white">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">
                      Jasa kurasi &amp; penghubung
                    </p>

                    <p className="mt-1.5 text-sm leading-6 text-gray-600">
                      Yang kamu bayar adalah jasa kurasi dan penghubung
                      ke pemilik kos — bukan jual-beli data kontak.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* ========================================
              02 — PEMBAYARAN
          ======================================== */}
          <Reveal>
            <section
              id="pembayaran"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="02"
                icon={CreditCardIcon}
                title="Pembayaran"
              />

              <p>
                Pembayaran dilakukan secara manual melalui transfer bank.
                Setelah pembayaran, kamu perlu mengirimkan bukti transfer
                melalui WhatsApp agar tim kami dapat melakukan verifikasi.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  title="Cara pembayaran"
                  description="Transfer bank sesuai nominal layanan yang kamu pilih."
                />

                <InfoCard
                  title="Waktu verifikasi"
                  description="Biasanya selesai dalam waktu kurang dari 1×24 jam setelah bukti transfer diterima."
                />
              </div>
            </section>
          </Reveal>

          {/* ========================================
              03 — REFUND
          ======================================== */}
          <Reveal>
            <section
              id="refund"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="03"
                icon={ArrowPathIcon}
                title="Kebijakan Refund"
              />

              <p>
                Dalam kondisi tertentu, pembayaran dapat dikembalikan.
                Berikut kondisi refund yang berlaku:
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {/* Refund available */}
                <div className="border-b border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <CheckIcon className="h-4.5 w-4.5 h-5 w-5" />
                    </div>

                    <p className="text-sm leading-6 text-gray-700 sm:text-base">
                      Refund penuh jika kos ternyata sudah tidak tersedia
                      saat verifikasi.
                    </p>
                  </div>
                </div>

                <div className="border-b border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <CheckIcon className="h-4.5 w-4.5 h-5 w-5" />
                    </div>

                    <p className="text-sm leading-6 text-gray-700 sm:text-base">
                      Refund penuh jika dibatalkan sebelum kontak atau
                      rekomendasi dikirim.
                    </p>
                  </div>
                </div>

                <div className="border-b border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <CheckIcon className="h-4.5 w-4.5 h-5 w-5" />
                    </div>

                    <p className="text-sm leading-6 text-gray-700 sm:text-base">
                      Refund kelebihan jika terjadi transfer ganda yang
                      tidak disengaja.
                    </p>
                  </div>
                </div>

                {/* No refund */}
                <div className="bg-red-50/50 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                      <XMarkIcon className="h-5 w-5" />
                    </div>

                    <p className="text-sm leading-6 text-gray-700 sm:text-base">
                      Tidak dapat direfund setelah kontak owner atau hasil
                      rekomendasi dikirim karena layanan dianggap sudah
                      diberikan.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-500 sm:text-base">
                Pengajuan refund dilakukan dengan menghubungi kami dan
                menyertakan kode referensi transaksimu.
              </p>
            </section>
          </Reveal>

          {/* ========================================
              04 — TANGGUNG JAWAB KAMI
          ======================================== */}
          <Reveal>
            <section
              id="tanggung-jawab"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="04"
                icon={ShieldCheckIcon}
                title="Tanggung Jawab Kami"
              />

              <p>
                Kami berusaha memastikan data kos akurat dan terkini
                melalui pembaruan berkala. Namun, kami tidak dapat
                menjamin ketersediaan kamar pada saat kamu menghubungi
                owner karena kondisi lapangan dapat berubah sewaktu-waktu
                di luar kendali kami.
              </p>

              <p className="mt-4">
                FimoStay juga tidak menjadi pihak dalam transaksi
                sewa-menyewa antara kamu dan pemilik kos.
              </p>
            </section>
          </Reveal>

          {/* ========================================
              05 — KEWAJIBAN PENGGUNA
          ======================================== */}
          <Reveal>
            <section
              id="kewajiban"
              className="scroll-mt-24 border-b border-gray-200 py-10 sm:py-12"
            >
              <SectionHeading
                number="05"
                icon={UserIcon}
                title="Kewajiban Pengguna"
              />

              <p>
                Kamu bertanggung jawab memberikan data yang benar, seperti
                nomor HP aktif dan preferensi yang jujur, agar layanan
                dapat kami berikan dengan baik.
              </p>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                  Penggunaan layanan
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                  Penyalahgunaan layanan, termasuk transaksi berulang tanpa
                  niat menggunakan layanan sebenarnya, dapat kami tolak.
                </p>
              </div>
            </section>
          </Reveal>

          {/* ========================================
              06 — PERUBAHAN KETENTUAN
          ======================================== */}
          <Reveal>
            <section
              id="perubahan"
              className="scroll-mt-24 pt-10 sm:pt-12"
            >
              <SectionHeading
                number="06"
                icon={DocumentTextIcon}
                title="Perubahan Ketentuan"
              />

              <p>
                Kami dapat memperbarui syarat dan ketentuan ini
                sewaktu-waktu. Perubahan signifikan akan kami informasikan
                melalui halaman ini.
              </p>

              <div className="mt-6 rounded-2xl border border-fimo-navy/10 bg-fimo-navy/[0.035] p-5 sm:p-6">
                <p className="text-sm font-semibold text-gray-900">
                  Gunakan layanan dengan nyaman
                </p>

                <p className="mt-1.5 text-sm leading-6 text-gray-600">
                  Dengan menggunakan layanan FimoStay, kamu dianggap telah
                  membaca dan memahami ketentuan yang berlaku.
                </p>
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fimo-navy text-white sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

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
   INFO CARD
======================================== */

function InfoCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  )
}