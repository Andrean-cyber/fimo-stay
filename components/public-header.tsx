'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const waNumber = '6289666783030'
const waDaftarKosMessage = encodeURIComponent(
  'Halo FimoStay, saya ingin mendaftarkan kos saya. Mohon info lebih lanjut ya.'
)
const waDaftarKosHref = `https://wa.me/${waNumber}?text=${waDaftarKosMessage}`

// Link yang tampil di nav desktop & menu dropdown tablet
const menuLinks = [
  { href: waDaftarKosHref, label: 'Daftarkan Kos', external: true },
  { href: '/tentang', label: 'Tentang Kami' },
  { href: '/faq', label: 'Pertanyaan Umum' },
  { href: '/kontak', label: 'Hubungi Kami' },
]

// Link dropdown khusus mobile - cuma 2 item sesuai permintaan
const mobileMenuLinks = [
  { href: '/kos', label: 'Cari Kos' },
  { href: '/rekomendasi/mulai', label: 'Minta Rekomendasi' },
]

// Item bottom navbar khusus mobile (Bootstrap Icons: <i className="bi bi-...">)
const mobileNavItems = [
  { href: '/', label: 'Home', icon: 'bi-house-door', iconActive: 'bi-house-door-fill', exact: true },
  { href: '/kos', label: 'Kos', icon: 'bi-door-open', iconActive: 'bi-door-open-fill' },
  { href: '/rekomendasi/mulai', label: 'Rekomendasi', fab: true },
  { href: '/tentang', label: 'Tentang', icon: 'bi-journal-text', iconActive: 'bi-journal-check' },
  { href: '/kontak', label: 'Hubungi', icon: 'bi-chat-dots', iconActive: 'bi-chat-dots-fill' },
]

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <>
      {/* Header atas mobile - logo kiri, hamburger kanan, hanya di bawah md */}
      <header className="sticky top-0 z-50 border-b border-fimo-gray bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/lgfimostay-blue.webp"
              alt="FimoStay"
              width={120}
              height={30}
              className="h-6 w-auto"
              priority
            />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex text-fimo-navy"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} text-2xl`} />
          </button>
        </div>

        {/* Dropdown menu mobile - cuma Cari Kos & Minta Rekomendasi */}
        {mobileMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-fimo-gray bg-white px-4 py-3">
            {mobileMenuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 transition-colors hover:bg-fimo-blue/10 hover:text-fimo-navy"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Header atas - disembunyikan total di mobile, tampil dari tablet (md) ke atas */}
      <header className="hidden border-b border-fimo-gray bg-white sticky top-0 z-50 md:block">
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

          {/* Nav links - hanya desktop (lg ke atas) */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 lg:flex">
            {menuLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-fimo-navy"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-fimo-navy"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            {/* CTA - hanya desktop */}
            <Link
              href="/rekomendasi/mulai"
              className="hidden items-center rounded-full bg-fimo-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fimo-navy/90 lg:inline-flex"
            >
              Minta Rekomendasi
            </Link>

            {/* Hamburger - hanya tablet (md sampai sebelum lg) */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex text-fimo-navy lg:hidden"
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menuOpen}
            >
              <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} text-2xl`} />
            </button>
          </div>
        </div>

        {/* Dropdown menu - hanya tablet */}
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-fimo-gray bg-white px-4 py-3 lg:hidden">
            {menuLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 transition-colors hover:bg-fimo-blue/10 hover:text-fimo-navy"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 transition-colors hover:bg-fimo-blue/10 hover:text-fimo-navy"
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              href="/rekomendasi/mulai"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-full bg-fimo-navy px-4 py-2.5 text-center text-base font-semibold text-white transition-colors hover:bg-fimo-navy/90"
            >
              Minta Rekomendasi
            </Link>
          </nav>
        )}
      </header>

      {/* Bottom navbar - hanya mobile (di bawah md), tanpa logo/gap di atas */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-fimo-gray bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Navigasi utama"
      >
        <div className="grid grid-cols-5">
          {mobileNavItems.map((item) => {
            if (item.fab) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-end pb-1.5"
                >
                  <span className="absolute -top-4 flex h-11 w-11 items-center justify-center rounded-full bg-fimo-navy text-white shadow-lg shadow-fimo-navy/30 ring-4 ring-white">
                    <i className="bi bi-plus-lg text-lg" />
                  </span>
                  <span className="mt-7 text-[10px] font-semibold text-fimo-navy">{item.label}</span>
                </Link>
              )
            }

            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-2 text-[10px]"
              >
                <i
                  className={`bi ${active ? item.iconActive : item.icon} text-lg ${
                    active ? 'text-fimo-navy' : 'text-gray-400'
                  }`}
                />
                <span className={active ? 'font-semibold text-fimo-navy' : 'text-gray-500'}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer supaya konten tidak ketutup bottom navbar di mobile - taruh di akhir halaman, BUKAN di sini */}
    </>
  )
}