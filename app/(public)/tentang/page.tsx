'use client'

import { useEffect, useRef, useState } from 'react'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

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

    // Respect users who prefer reduced motion
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

export default function TentangPage() {
  // Simple fade-in when the page first mounts
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

          <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-12 sm:px-6 sm:pb-18 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
            <div
              className={`
                mx-auto max-w-4xl text-center
                transform-gpu transition-all duration-700 ease-out
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              {/* Badge */}
              <div
                style={{ transitionDelay: mounted ? '80ms' : '0ms' }}
                className={`
                  mb-5 inline-flex items-center gap-1.5 rounded-full border border-fimo-navy/15 bg-fimo-navy/[0.04] px-3 py-1.5 text-[10px] font-bold tracking-wide text-fimo-navy sm:mb-6 sm:text-xs
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                `}
              >
                <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                TENTANG FIMOSTAY
              </div>

              {/* Main heading */}
              <h1
                style={{ transitionDelay: mounted ? '160ms' : '0ms' }}
                className={`
                  text-[30px]
                  font-bold
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-fimo-navy
                  sm:text-[42px]
                  lg:text-[56px]
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
              >
                Capek keliling cari kos,
                <br className="hidden sm:block" />
                <span className="text-gray-900"> ternyata sudah penuh?</span>
              </h1>

              {/* Description */}
              <p
                style={{ transitionDelay: mounted ? '260ms' : '0ms' }}
                className={`
                  mx-auto
                  mt-5
                  max-w-2xl
                  text-[14px]
                  leading-6
                  text-gray-600
                  sm:mt-6
                  sm:text-base
                  sm:leading-7
                  lg:text-lg
                  transition-all duration-700 ease-out
                  ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
              >
                Itu masalah yang bikin FimoStay ada. Kami ingin membuat
                pencarian kos terasa lebih sederhana dengan data yang
                benar-benar dicek dan diperbarui oleh tim kami.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================
            CORE VALUES
        ======================================== */}
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fimo-navy sm:text-xs">
              Kenapa FimoStay?
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Bukan sekadar daftar kos
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
              Kami fokus pada hal yang paling penting saat mencari tempat
              tinggal: informasi yang bisa dipercaya.
            </p>
          </Reveal>

          <div className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
            <Reveal delay={0}>
              <FeatureCard
                icon={ShieldCheckIcon}
                title="Dicek Langsung"
                description="Setiap kos didatangi dan didokumentasikan tim kami, bukan sekadar mengandalkan foto kiriman owner."
              />
            </Reveal>

            <Reveal delay={120}>
              <FeatureCard
                icon={ArrowPathIcon}
                title="Selalu Diperbarui"
                description="Kos yang tidak diperbarui tim kami dalam 7 hari otomatis kami sembunyikan dari pencarian."
              />
            </Reveal>

            <Reveal delay={240}>
              <FeatureCard
                icon={UserGroupIcon}
                title="Dibantu Manusia"
                description="Bukan cuma listing otomatis. Tim kami juga siap membantu mencarikan rekomendasi sesuai kebutuhanmu."
              />
            </Reveal>
          </div>
        </section>

        {/* ========================================
            HOW IT WORKS
        ======================================== */}
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <Reveal className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fimo-navy sm:text-xs">
                Sederhana saja
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Bagaimana cara kerjanya?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Dari menemukan kos sampai terhubung dengan owner, prosesnya
                dibuat sesingkat mungkin.
              </p>
            </Reveal>

            <div className="mt-10 sm:mt-12">
              <div className="grid gap-0 md:grid-cols-3 md:gap-5">
                <Reveal delay={0}>
                  <StepCard
                    number="01"
                    icon={MagnifyingGlassIcon}
                    title="Cari atau minta rekomendasi"
                    description="Telusuri kos berdasarkan lokasi dan fasilitas, atau ceritakan kriteriamu kepada tim kami."
                  />
                </Reveal>

                <Reveal delay={120}>
                  <StepCard
                    number="02"
                    icon={CreditCardIcon}
                    title="Bayar & verifikasi"
                    description="Lakukan pembayaran dan konfirmasi melalui WhatsApp. Tim kami akan melakukan verifikasi."
                  />
                </Reveal>

                <Reveal delay={240}>
                  <StepCard
                    number="03"
                    icon={ChatBubbleLeftRightIcon}
                    title="Terhubung dengan owner"
                    description="Setelah terverifikasi, kamu bisa langsung menghubungi pemilik kos untuk survey atau booking."
                  />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            TRUST / PROMISE
        ======================================== */}
        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-fimo-navy px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
              {/* Decorative circle */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.05]"
              />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-white/80" />

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">
                      Komitmen FimoStay
                    </p>
                  </div>

                  <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                    Lebih sedikit waktu buang-buang,
                    <br className="hidden sm:block" />
                    lebih banyak kos yang benar-benar bisa dipilih.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                    Karena menurut kami, mencari tempat tinggal seharusnya
                    tidak perlu terasa seperti berburu informasi yang sudah
                    kadaluarsa.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

/* ========================================
   FEATURE CARD
======================================== */

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
}) {
  return (
    <div
      className="
        group
        rounded-3xl
        border border-gray-200
        bg-white
        p-5
        shadow-[0_6px_24px_rgba(0,0,0,0.025)]
        transition-all duration-200
        hover:-translate-y-1
        hover:border-fimo-navy/15
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)]
        sm:p-6
      "
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fimo-navy/[0.06] text-fimo-navy transition-colors group-hover:bg-fimo-navy group-hover:text-white sm:h-12 sm:w-12">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <h3 className="mt-5 text-base font-bold text-gray-900 sm:text-lg">
        {title}
      </h3>

      <p className="mt-2 text-[13px] leading-5.5 text-gray-500 sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  )
}

/* ========================================
   STEP CARD
======================================== */

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
}) {
  return (
    <div className="relative border-l border-gray-200 pb-9 pl-12 last:border-l-0 last:pb-0 md:border-l-0 md:pb-0 md:pl-0">
      {/* Number / Icon */}
      <div className="absolute -left-[18px] top-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-fimo-navy text-white md:static md:mb-5 md:h-11 md:w-11 md:rounded-2xl md:border-0">
        <Icon className="hidden h-5 w-5 md:block" />

        <span className="text-[10px] font-bold md:hidden">{number}</span>
      </div>

      {/* Desktop connector */}
      {number !== '03' && (
        <div
          aria-hidden="true"
          className="absolute left-11 top-5 hidden h-px w-[calc(100%-1rem)] bg-gray-200 md:block"
        />
      )}

      <div className="relative">
        <span className="hidden text-[10px] font-bold tracking-[0.16em] text-gray-400 md:block">
          {number}
        </span>

        <h3 className="mt-0 text-base font-bold text-gray-900 md:mt-2 md:text-lg">
          {title}
        </h3>

        <p className="mt-1.5 text-[13px] leading-5.5 text-gray-500 sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>
    </div>
  )
}