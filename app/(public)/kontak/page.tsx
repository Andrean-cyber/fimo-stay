'use client'

import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ArrowUpRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export default function KontakPage() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`

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
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-fimo-navy/15 bg-fimo-navy/[0.04] px-3 py-1.5 text-[11px] font-semibold text-fimo-navy sm:mb-5 sm:text-xs">
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                HUBUNGI KAMI
              </div>

              {/* Title */}
              <h1
                className="
                  text-[30px]
                  font-bold
                  leading-[1.08]
                  tracking-[-0.03em]
                  text-fimo-navy
                  sm:text-[40px]
                  lg:text-[52px]
                "
              >
                Ada yang bisa kami bantu?
              </h1>

              {/* Description */}
              <p
                className="
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
                "
              >
                Pertanyaan soal kos, transaksi, atau butuh bantuan lain —
                tim FimoStay siap membantu.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================
            CONTACT OPTIONS
        ======================================== */}
        <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {/* WHATSAPP */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative overflow-hidden
                rounded-3xl
                border border-gray-200
                bg-white
                p-5
                shadow-[0_6px_24px_rgba(0,0,0,0.03)]
                transition-all duration-200
                hover:-translate-y-1
                hover:border-green-300
                hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-500
                focus-visible:ring-offset-2
                sm:p-6
              "
            >
              {/* Decorative background */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute -right-12 -top-12
                  h-32 w-32
                  rounded-full
                  bg-green-500/[0.06]
                  transition-transform duration-300
                  group-hover:scale-125
                "
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      flex h-12 w-12
                      items-center justify-center
                      rounded-2xl
                      bg-green-50
                      text-green-600
                      sm:h-14 sm:w-14
                    "
                  >
                    <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <ArrowUpRightIcon
                    className="
                      h-5 w-5
                      text-gray-300
                      transition-all duration-200
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:text-green-600
                    "
                  />
                </div>

                <div className="mt-6">
                  <p className="text-lg font-bold text-gray-900 sm:text-xl">
                    WhatsApp
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-gray-500">
                    Cara tercepat untuk mendapatkan bantuan dari tim
                    FimoStay.
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-green-600 sm:text-sm">
                  <span>Chat dengan kami</span>
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </div>
              </div>
            </a>

            {/* EMAIL */}
            <a
              href="mailto:fimostay@gmail.com"
              className="
                group relative overflow-hidden
                rounded-3xl
                border border-gray-200
                bg-white
                p-5
                shadow-[0_6px_24px_rgba(0,0,0,0.03)]
                transition-all duration-200
                hover:-translate-y-1
                hover:border-fimo-navy/20
                hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-fimo-navy
                focus-visible:ring-offset-2
                sm:p-6
              "
            >
              {/* Decorative background */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute -right-12 -top-12
                  h-32 w-32
                  rounded-full
                  bg-fimo-navy/[0.04]
                  transition-transform duration-300
                  group-hover:scale-125
                "
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      flex h-12 w-12
                      items-center justify-center
                      rounded-2xl
                      bg-fimo-navy/[0.06]
                      text-fimo-navy
                      sm:h-14 sm:w-14
                    "
                  >
                    <EnvelopeIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <ArrowUpRightIcon
                    className="
                      h-5 w-5
                      text-gray-300
                      transition-all duration-200
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:text-fimo-navy
                    "
                  />
                </div>

                <div className="mt-6">
                  <p className="text-lg font-bold text-gray-900 sm:text-xl">
                    Email
                  </p>

                  <p className="mt-1.5 break-all text-sm leading-6 text-gray-500">
                    fimostay@gmail.com
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-fimo-navy sm:text-sm">
                  <span>Kirim email</span>
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </div>
              </div>
            </a>
          </div>

          {/* ========================================
              TRANSACTION HELP
          ======================================== */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:mt-6 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fimo-navy/[0.06] text-fimo-navy sm:h-10 sm:w-10">
                <ClockIcon className="h-4.5 w-4.5 h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  Sedang mengalami masalah dengan transaksi?
                </p>

                <p className="mt-1 text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                  Siapkan kode referensi transaksimu. Kode tersebut bisa
                  dilihat di halaman status transaksi agar kami bisa
                  membantu lebih cepat.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
              SMALL TRUST NOTE
          ======================================== */}
          <div className="mt-8 text-center sm:mt-10">
            <p className="text-xs leading-5 text-gray-400 sm:text-sm">
              Tidak yakin harus menghubungi lewat mana?
              <br className="sm:hidden" />{' '}
              <span className="font-medium text-gray-500">
                WhatsApp adalah pilihan tercepat.
              </span>
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}