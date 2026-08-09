import { PublicHeader } from '@/components/public-header'
import { SearchForm } from '@/app/(public)/kos/search-form'

export default function HomePage() {
  return (
    <div>
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold mb-2">Cari Kos di Sekitarmu</h1>
        <p className="text-gray-500 mb-8">
          Temukan kos terverifikasi FimoStay, atau minta tim kami rekomendasikan 5 kos terbaik untukmu.
        </p>
        <div className="flex justify-center">
          <SearchForm />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Tidak mau repot cari sendiri?{' '}
          <a href="/rekomendasi/mulai" className="underline font-medium">
            Minta 3 rekomendasi dari tim kami
          </a>
        </p>
      </main>
    </div>
  )
}