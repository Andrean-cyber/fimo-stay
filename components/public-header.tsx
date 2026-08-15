'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/kos', label: 'Cari Kos' },
  { href: '/rekomendasi/mulai', label: 'Minta Rekomendasi' },
  { href: '/status/cek', label: 'Cek Status' },
]

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-fimo-gray bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <Image
            src="/lgfimostay-blue.webp"
            alt="FimoStay"
            width={140}
            height={36}
            className="h-7 w-auto md:h-9"
            priority
          />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex md:text-base md:gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-fimo-navy">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="text-fimo-navy md:hidden"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Nav mobile */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-fimo-gray bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 transition-colors hover:bg-fimo-blue/10 hover:text-fimo-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}