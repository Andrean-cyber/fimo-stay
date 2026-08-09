import Link from 'next/link'

export function PublicHeader() {
  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">FimoStay</Link>
        <nav className="text-sm text-gray-600 flex gap-4">
          <Link href="/kos">Cari Kos</Link>
          <Link href="/rekomendasi/mulai">Minta Rekomendasi</Link>
        </nav>
      </div>
    </header>
  )
}