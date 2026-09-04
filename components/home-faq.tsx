'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const HOME_FAQ_ITEMS = [
  {
    q: 'Apakah saya perlu membuat akun untuk pakai FimoStay?',
    a: 'Tidak. Kamu cukup masukkan nomor HP saat bertransaksi — tidak perlu daftar, verifikasi email, atau membuat password.',
  },
  {
    q: 'Kenapa harus bayar untuk lihat kontak owner?',
    a: 'Yang kamu bayar bukan sekadar nomor kontak, tetapi jasa verifikasi dan kurasi kos sebelum menghubungkanmu ke owner.',
  },
  {
    q: 'Bagaimana kalau kos yang saya pilih ternyata sudah penuh?',
    a: 'Kamu berhak mendapatkan refund penuh jika kos ternyata sudah penuh saat proses verifikasi.',
  },
  {
    q: 'Bagaimana cara pembayaran diverifikasi?',
    a: 'Kirim bukti transfer beserta kode referensi ke WhatsApp kami. Verifikasi manual biasanya selesai kurang dari 1x24 jam.',
  },
  {
    q: 'Apa bedanya "Cari Sendiri" dan "Minta Rekomendasi"?',
    a: '"Cari Sendiri" untuk kamu yang sudah menemukan kos pilihan. "Minta Rekomendasi" untuk kamu yang ingin tim kami mencarikan kos terbaik sesuai kriteriamu.',
  },
]

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      <div className="mb-3 flex items-end justify-between sm:mb-5">
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fimo-blue sm:mb-1 sm:text-xs sm:tracking-[0.18em]">
            Masih ragu?
          </p>
          <h2 className="text-base font-bold text-fimo-navy sm:text-2xl sm:text-3xl">
            Pertanyaan Umum
          </h2>
        </div>
        <Link
          href="/faq"
          className="flex items-center gap-1 text-xs font-semibold text-fimo-navy hover:text-fimo-blue sm:text-sm"
        >
          Lihat semua<ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {HOME_FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index
          const answerId = `home-faq-answer-${index}`

          return (
            <div key={item.q} className="border-b border-gray-100 last:border-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 sm:px-5 sm:py-4"
              >
                <span className="flex-1 pr-1 text-[13px] font-semibold leading-5 text-gray-900 group-hover:text-fimo-navy sm:text-sm sm:leading-6">
                  {item.q}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-7 sm:w-7 ${
                    isOpen
                      ? 'border-fimo-navy bg-fimo-navy text-white'
                      : 'border-gray-200 text-gray-400 group-hover:border-fimo-navy/30 group-hover:text-fimo-navy'
                  }`}
                >
                  <ChevronDownIcon
                    className={`h-3 w-3 transition-transform duration-200 sm:h-3.5 sm:w-3.5 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              <div
                id={answerId}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 pr-8 text-[12.5px] leading-5 text-gray-600 sm:px-5 sm:pr-10 sm:text-sm sm:leading-6">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}