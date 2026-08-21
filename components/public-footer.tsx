import Link from 'next/link'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()
  const waNumber = '6289666783030'
  const waGeneralMessage = encodeURIComponent('Halo FimoStay, saya ingin bertanya tentang kos yang tersedia.')
  const waDaftarKosMessage = encodeURIComponent('Halo FimoStay, saya ingin mendaftarkan kos saya. Mohon info lebih lanjut ya.')

  return (
    <footer className="bg-white text-fimo-navy">


      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <img src="/lgfimostay-blue.webp" alt="FimoStay" className="h-8 w-auto" />
            </Link>

            <p className="mt-3 max-w-md text-sm leading-5 text-gray-500">
              Membantu kamu menemukan kos yang sesuai kebutuhan, dengan informasi yang lebih jelas dan data yang terus diperbarui.
            </p>

            {/* Social */}
            <div className="mt-4 flex items-center gap-2">
              <a href={`https://wa.me/${waNumber}?text=${waGeneralMessage}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp FimoStay" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-200 hover:border-fimo-navy hover:bg-fimo-navy hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.28-1.38a9.9 9.9 0 0 0 4.71 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11-.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.72-2.09.98-2.37c.25-.28.54-.35.72-.35.18 0 .36 0 .52.01.16.01.39-.06.6.47.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.6-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.18-.21.74-.86.94-1.16.2-.29.39-.24.66-.14.27.1 1.7.8 2 .94.29.13.49.22.56.35.07.13.07.75-.17 1.42z" />
                </svg>
              </a>

              <a href="https://instagram.com/fimostay" target="_blank" rel="noopener noreferrer" aria-label="Instagram FimoStay" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-200 hover:border-fimo-navy hover:bg-fimo-navy hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a href="https://tiktok.com/@fimostay" target="_blank" rel="noopener noreferrer" aria-label="TikTok FimoStay" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-200 hover:border-fimo-navy hover:bg-fimo-navy hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M16.6 5.82c-.9-.78-1.47-1.9-1.55-3.16h-3.03v13.44c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1-2.72-2.72 2.72 2.72 0 0 1 2.72-2.72c.3 0 .59.05.86.14V10.4a5.75 5.75 0 0 0-.86-.06 5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 5.75-5.75V9.01a8.24 8.24 0 0 0 4.82 1.54V7.52c-1.09 0-2.1-.32-2.95-.87-.1-.06-.21-.13-.32-.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Informasi */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Informasi</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/tentang" className="text-sm text-gray-600 transition-colors hover:text-fimo-navy">Tentang Kami</Link></li>
              <li><Link href="/syarat" className="text-sm text-gray-600 transition-colors hover:text-fimo-navy">Syarat & Ketentuan</Link></li>
              <li><Link href="/kebijakan-privasi" className="text-sm text-gray-600 transition-colors hover:text-fimo-navy">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Bantuan</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/kontak" className="text-sm text-gray-600 transition-colors hover:text-fimo-navy">Hubungi Kami</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-600 transition-colors hover:text-fimo-navy">Pertanyaan Umum</Link></li>
            </ul>
          </div>

          {/* Pemilik Kos */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Untuk Pemilik</h3>
            <p className="mt-4 text-sm leading-5 text-gray-500">Ingin kosmu ditemukan calon penghuni yang tepat?</p>
            <a href={`https://wa.me/${waNumber}?text=${waDaftarKosMessage}`} target="_blank" rel="noopener noreferrer" className="group mt-3 inline-flex items-center gap-2 text-sm font-semibold text-fimo-navy">
              Daftarkan Kos
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M4.5 10H15.5M15.5 10L10.5 5M15.5 10L10.5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-gray-100 pt-5 sm:mt-10 sm:flex sm:items-center sm:justify-between sm:pt-6">
          <p className="text-xs text-gray-400 sm:text-sm">© {currentYear} FimoStay. All Rights Reserved.</p>
          <p className="mt-1.5 text-xs text-gray-400 sm:mt-0 sm:text-sm">Cari kos sekarang lebih mudah</p>
        </div>
      </div>
    </footer>
  )
}