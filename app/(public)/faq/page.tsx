'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    label: 'Mulai Cari Kos',
    description: 'Cara menggunakan FimoStay',
    icon: MagnifyingGlassIcon,
  },
  {
    id: 'account',
    label: 'Akun & Transaksi',
    description: 'Akun, pembayaran & status',
    icon: AcademicCapIcon,
  },
  {
    id: 'payment',
    label: 'Pembayaran',
    description: 'Pembayaran & verifikasi',
    icon: CreditCardIcon,
  },
  {
    id: 'trust',
    label: 'Keamanan',
    description: 'Verifikasi & jaminan',
    icon: ShieldCheckIcon,
  },
]

const FAQ_ITEMS = [
  {
    category: 'getting-started',
    q: 'Apakah saya perlu membuat akun untuk pakai FimoStay?',
    a: 'Tidak. Kamu cukup masukkan nomor HP saat bertransaksi — tidak perlu daftar, verifikasi email, atau membuat password.',
  },
  {
    category: 'getting-started',
    q: 'Apa bedanya "Cari Sendiri" dan "Minta Rekomendasi"?',
    a: '"Cari Sendiri" cocok untuk kamu yang sudah menemukan kos pilihan dan ingin langsung membuka kontak owner. "Minta Rekomendasi" cocok untuk kamu yang ingin tim FimoStay mencarikan 3 kos terbaik sesuai kriteriamu.',
  },
  {
    category: 'getting-started',
    q: 'Berapa lama saya harus menunggu hasil rekomendasi?',
    a: 'Setelah pembayaran terverifikasi, tim kami akan memilihkan 3 kos sesuai preferensimu dan mengirimkan link hasilnya melalui WhatsApp.',
  },
  {
    category: 'payment',
    q: 'Kenapa harus bayar untuk lihat kontak owner?',
    a: 'Yang kamu bayar bukan sekadar nomor kontak, tetapi jasa verifikasi dan kurasi. Tim kami mengecek kondisi kos dan memastikan data yang tersedia masih akurat sebelum menghubungkanmu ke owner.',
  },
  {
    category: 'payment',
    q: 'Bagaimana cara pembayaran diverifikasi?',
    a: 'Setelah transfer, kamu kirim bukti transfer beserta kode referensi ke WhatsApp kami. Tim akan melakukan verifikasi manual, biasanya selesai dalam waktu kurang dari 1x24 jam.',
  },
  {
    category: 'trust',
    q: 'Bagaimana kalau kos yang saya pilih ternyata sudah penuh?',
    a: 'Kami berusaha menjaga data selalu update. Namun jika ternyata kos sudah penuh saat proses verifikasi, kamu berhak mendapatkan refund penuh. Hubungi kami dengan kode referensi transaksi.',
  },
  {
    category: 'account',
    q: 'Apakah saya bisa cek riwayat transaksi saya?',
    a: 'Setiap transaksi memiliki halaman status unik yang dikirim ke WhatsApp kamu. Simpan link tersebut untuk mengecek status transaksi kapan saja.',
  },
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

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('getting-started')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Fade-in saat halaman pertama dimuat (konsisten dengan halaman lain)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const visibleFaqs = FAQ_ITEMS.filter(
    (item) => item.category === activeCategory
  )

  const toggleFaq = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-950">
      <PublicHeader />
  
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-gray-200 bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                'radial-gradient(#123B6D 0.7px, transparent 0.7px)',
              backgroundSize: '18px 18px',
              maskImage:
                'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />
  
          <div
            className={`
              relative mx-auto max-w-5xl px-5 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16 lg:pt-20 lg:pb-20
              transform-gpu transition-all duration-700 ease-out
              ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
          >
            {/* Badge */}
            <div
              style={{ transitionDelay: mounted ? '80ms' : '0ms' }}
              className={`
                mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-fimo-navy/15 bg-fimo-navy/[0.04] px-3 py-1.5 text-[11px] font-semibold text-fimo-navy sm:mb-5 sm:text-xs
                transition-all duration-700 ease-out
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
              `}
            >
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Pertanyaan Umum
            </div>
  
            {/* Heading */}
            <h1
              style={{ transitionDelay: mounted ? '160ms' : '0ms' }}
              className={`
                mx-auto max-w-3xl
                text-[30px] leading-[1.08] tracking-[-0.03em]
                font-bold text-fimo-navy
                sm:text-[40px]
                sm:leading-[1.08]
                lg:text-[56px]
                xl:text-[60px]
                transition-all duration-700 ease-out
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              Bingung soal FimoStay?
              <br />
              <span className="text-fimo-navy/60">
                Kami punya jawabannya.
              </span>
            </h1>
  
            {/* Subtitle */}
            <p
              style={{ transitionDelay: mounted ? '260ms' : '0ms' }}
              className={`
                mx-auto mt-4 max-w-xl
                text-[14px] leading-6 text-gray-600
                sm:mt-5 sm:text-base sm:leading-7
                lg:text-lg
                transition-all duration-700 ease-out
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              Semua yang perlu kamu tahu sebelum mulai mencari kos,
              melakukan pembayaran, sampai mendapatkan kontak owner.
            </p>
          </div>
        </section>
  
        {/* FAQ CONTENT */}
        <section
          className="
            mx-auto max-w-6xl
            px-4 py-10
            sm:px-6 sm:py-14
            lg:px-8 lg:py-20
          "
        >
          <div
            className="
              grid gap-8
              lg:grid-cols-[280px_minmax(0,1fr)]
              lg:gap-10
            "
          >
            {/* CATEGORY */}
            <Reveal>
              <aside>
                <div className="lg:sticky lg:top-24">
                  <div className="mb-4 px-1 sm:mb-5">
                    <p className="text-sm font-bold text-gray-900 sm:text-base">
                      Cari berdasarkan topik
                    </p>
  
                    <p className="mt-1 text-[13px] leading-5 text-gray-500 sm:text-sm">
                      Pilih topik yang paling sesuai dengan pertanyaanmu.
                    </p>
                  </div>
  
                  {/* 
                    Mobile: 2 columns
                    Desktop: 1 column
                  */}
                  <nav className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
                    {FAQ_CATEGORIES.map((category) => {
                      const Icon = category.icon
                      const isActive = activeCategory === category.id
  
                      const count = FAQ_ITEMS.filter(
                        (item) => item.category === category.id
                      ).length
  
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setActiveCategory(category.id)
                            setOpenIndex(null)
                          }}
                          className={`
                            group flex min-w-0 items-center gap-2.5
                            rounded-xl border p-2.5
                            text-left transition-all duration-200
                            sm:gap-3 sm:rounded-2xl sm:p-3
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-fimo-navy
                            focus-visible:ring-offset-2
                            ${
                              isActive
                                ? 'border-fimo-navy/15 bg-white shadow-sm'
                                : 'border-transparent bg-white/50 hover:border-gray-200 hover:bg-white'
                            }
                          `}
                        >
                          <span
                            className={`
                              flex h-9 w-9 shrink-0 items-center
                              justify-center rounded-lg
                              sm:h-10 sm:w-10 sm:rounded-xl
                              transition-colors duration-200
                              ${
                                isActive
                                  ? 'bg-fimo-navy text-white'
                                  : 'bg-fimo-navy/[0.06] text-fimo-navy'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </span>
  
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-semibold text-gray-900 sm:text-sm">
                              {category.label}
                            </span>
  
                            <span className="mt-0.5 block truncate text-[10px] text-gray-500 sm:text-xs">
                              {category.description}
                            </span>
                          </span>
  
                          <span className="hidden text-xs font-medium text-gray-400 sm:block">
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
  
                  {/* HELP CARD */}
                  <div className="mt-4 hidden overflow-hidden rounded-2xl bg-fimo-navy p-5 text-white lg:block">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </div>
  
                    <h3 className="mt-4 text-sm font-bold">
                      Masih punya pertanyaan?
                    </h3>
  
                    <p className="mt-1.5 text-xs leading-5 text-white/65">
                      Tim FimoStay siap membantu kalau kamu belum menemukan
                      jawabannya.
                    </p>
  
                    <button
                      type="button"
                      className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-fimo-navy transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Hubungi FimoStay
                    </button>
                  </div>
                </div>
              </aside>
            </Reveal>
  
            {/* QUESTIONS */}
            <Reveal delay={120}>
              <div
                className="
                  overflow-hidden rounded-2xl
                  border border-gray-200 bg-white
                  shadow-[0_6px_24px_rgba(0,0,0,0.03)]
                  sm:rounded-3xl sm:p-1
                "
              >
                <div className="border-b border-gray-100 px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {
                      FAQ_CATEGORIES.find(
                        (category) => category.id === activeCategory
                      )?.label
                    }
                  </p>
  
                  <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
                    {visibleFaqs.length} pertanyaan
                  </p>
                </div>
  
                <div>
                  {visibleFaqs.map((item, index) => {
                    const isOpen = openIndex === index
                    const answerId = `faq-answer-${activeCategory}-${index}`
  
                    return (
                      <div
                        key={item.q}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(index)}
                          aria-expanded={isOpen}
                          aria-controls={answerId}
                          className="
                            group flex w-full items-center gap-3
                            px-4 py-4 text-left
                            transition-colors
                            hover:bg-gray-50
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-inset
                            focus-visible:ring-fimo-navy
                            sm:gap-4 sm:px-5 sm:py-5
                          "
                        >
                          <span
                            className="
                              flex-1 pr-1
                              text-[14px] font-semibold
                              leading-5 text-gray-900
                              group-hover:text-fimo-navy
                              sm:text-base sm:leading-6
                            "
                          >
                            {item.q}
                          </span>
  
                          <span
                            className={`
                              flex h-7 w-7 shrink-0 items-center
                              justify-center rounded-full border
                              transition-all duration-200
                              sm:h-8 sm:w-8
                              ${
                                isOpen
                                  ? 'border-fimo-navy bg-fimo-navy text-white'
                                  : 'border-gray-200 text-gray-400 group-hover:border-fimo-navy/30 group-hover:text-fimo-navy'
                              }
                            `}
                          >
                            <ChevronDownIcon
                              className={`
                                h-3.5 w-3.5
                                transition-transform duration-200
                                sm:h-4 sm:w-4
                                ${isOpen ? 'rotate-180' : ''}
                              `}
                            />
                          </span>
                        </button>
  
                        <div
                          id={answerId}
                          className={`
                            grid transition-[grid-template-rows,opacity]
                            duration-200
                            ${
                              isOpen
                                ? 'grid-rows-[1fr] opacity-100'
                                : 'grid-rows-[0fr] opacity-0'
                            }
                          `}
                        >
                          <div className="overflow-hidden">
                            <p
                              className="
                                px-4 pb-5 pr-12
                                text-[13px] leading-6 text-gray-600
                                sm:px-5 sm:pb-6 sm:pr-16
                                sm:text-sm sm:leading-6
                              "
                            >
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          </div>
  
          {/* MOBILE HELP CTA */}
          <Reveal delay={0} className="mt-6 lg:hidden">
            <div className="rounded-2xl bg-fimo-navy p-5 text-white sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </div>
  
                <div className="min-w-0">
                  <h3 className="text-sm font-bold sm:text-base">
                    Masih punya pertanyaan?
                  </h3>
  
                  <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">
                    Tim FimoStay siap membantu kalau kamu belum menemukan
                    jawabannya.
                  </p>
                </div>
              </div>
  
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-fimo-navy transition-transform hover:-translate-y-0.5 sm:text-sm"
              >
                Hubungi FimoStay
              </button>
            </div>
          </Reveal>
        </section>
      </main>
  
      <PublicFooter />
    </div>
  )
}