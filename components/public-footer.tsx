import Link from 'next/link'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-fimo-gray bg-fimo-navy text-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-7 px-4 py-8 sm:grid-cols-2 sm:gap-10 sm:py-12 md:grid-cols-4 md:gap-8">
        <div className="sm:col-span-2 md:col-span-1">
          <Link href="/" className="inline-block text-base font-bold text-white transition-colors hover:text-fimo-blue md:text-lg">
            FimoStay
          </Link>

          <p className="mt-1 text-[13px] md:text-base">Cari Kos Jadi Gampang</p>

          <div className="mt-4 flex items-center gap-3.5 sm:mt-5 sm:gap-4">
            <a href="https://wa.me/6280000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp FimoStay" className="text-white/70 transition-colors hover:text-fimo-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 md:h-[22px] md:w-[22px]">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.28-1.38a9.9 9.9 0 0 0 4.71 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.72-2.09.98-2.37c.25-.28.54-.35.72-.35.18 0 .36 0 .52.01.16.01.39-.06.6.47.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.18-.21.74-.86.94-1.16.2-.29.39-.24.66-.14.27.1 1.7.8 2 .94.29.15.49.22.56.35.07.13.07.75-.17 1.42z" />
              </svg>
            </a>

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram FimoStay" className="text-white/70 transition-colors hover:text-fimo-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-[22px] md:w-[22px]">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok FimoStay" className="text-white/70 transition-colors hover:text-fimo-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 md:h-[22px] md:w-[22px]">
                <path d="M16.6 5.82c-.9-.78-1.47-1.9-1.55-3.16h-3.03v13.44c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1-2.72-2.72 2.72 2.72 0 0 1 2.72-2.72c.3 0 .59.05.86.14V10.4a5.75 5.75 0 0 0-.86-.06 5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 5.75-5.75V9.01a8.24 8.24 0 0 0 4.82 1.54V7.52c-1.09 0-2.1-.32-2.95-.87-.1-.06-.21-.13-.32-.2-.03 0 0 0 0 0z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50 sm:mb-4 md:text-sm">
            Informasi
          </h3>
          <ul className="space-y-2.5 text-[13px] sm:space-y-3 sm:text-sm md:text-base">
            <li>
              <Link href="/tentang" className="transition-colors hover:text-fimo-blue">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/syarat" className="transition-colors hover:text-fimo-blue">
                Syarat & Ketentuan
              </Link>
            </li>
            <li>
              <Link href="/kebijakan-privasi" className="transition-colors hover:text-fimo-blue">
                Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50 sm:mb-4 md:text-sm">
            Bantuan
          </h3>
          <ul className="space-y-2.5 text-[13px] sm:space-y-3 sm:text-sm md:text-base">
            <li>
              <Link href="/kontak" className="transition-colors hover:text-fimo-blue">
                Hubungi Kami
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-fimo-blue">
                Pertanyaan Umum
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50 sm:mb-4 md:text-sm">
            Untuk Pemilik Kos
          </h3>
          <ul className="space-y-2.5 text-[13px] sm:space-y-3 sm:text-sm md:text-base">
            <li>
              <Link href="/daftar-kos" className="transition-colors hover:text-fimo-blue">
                Daftarkan Kos Anda
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mx-auto max-w-6xl text-center text-[11px] text-white/50 sm:text-xs md:text-sm">
          © {currentYear} FimoStay. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
