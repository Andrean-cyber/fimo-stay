import { PublicHeader } from '@/components/public-header'
import { RecommendationForm } from './recommendation-form'

export default function MintaRekomendasiPage() {
  return (
    <div>
      <PublicHeader />
      <main className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-xl font-semibold mb-2">Minta Rekomendasi Kos</h1>
        <p className="text-gray-500 mb-6">Ceritakan kebutuhanmu, tim kami pilihkan 3 kos terbaik.</p>
        <RecommendationForm />
      </main>
    </div>
  )
}