import Link from 'next/link'
import { Music2 } from 'lucide-react'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-fimo-gray bg-fimo-navy text-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:gap-8">

        {/* Brand */}
        <div className="sm:col-span-2 md:col-span-1">
          <Link
            href="/"
            className="inline-block text-lg font-bold text-white transition-colors hover:text-fimo-blue"
          >
            FimoStay
          </Link>

          <p className="mt-1 text-sm">
            Cari Kos Jadi Gampang
          </p>

          {/* Social Media */}
          <div className="mt-5 flex items-center gap-4">

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram FimoStay"
              className="text-white/70 transition-colors hover:text-fimo-blue"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok FimoStay"
              className="text-white/70 transition-colors hover:text-fimo-blue"
            >
              <Music2 className="h-5 w-5" />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube FimoStay"
              className="text-white/70 transition-colors hover:text-fimo-blue"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.25z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>

          </div>
        </div>

        {/* Informasi */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">
            Informasi
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/tentang"
                className="transition-colors hover:text-fimo-blue"
              >
                Tentang Kami
              </Link>
            </li>

            <li>
              <Link
                href="/syarat"
                className="transition-colors hover:text-fimo-blue"
              >
                Syarat & Ketentuan
              </Link>
            </li>

            <li>
              <Link
                href="/kebijakan-privasi"
                className="transition-colors hover:text-fimo-blue"
              >
                Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </div>

        {/* Bantuan */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">
            Bantuan
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/kontak"
                className="transition-colors hover:text-fimo-blue"
              >
                Hubungi Kami
              </Link>
            </li>

            <li>
              <Link
                href="/faq"
                className="transition-colors hover:text-fimo-blue"
              >
                Pertanyaan Umum
              </Link>
            </li>
          </ul>
        </div>

        {/* Pemilik Kos */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">
            Untuk Pemilik Kos
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/daftar-kos"
                className="transition-colors hover:text-fimo-blue"
              >
                Daftarkan Kos Anda
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mx-auto max-w-6xl text-center text-xs text-white/50">
          © {currentYear} FimoStay. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  )
}