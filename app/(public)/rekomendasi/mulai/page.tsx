import { PublicHeader } from '@/components/public-header'
import { RecommendationForm } from './recommendation-form'

export default function MintaRekomendasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-xl font-bold text-fimo-navy">Minta Rekomendasi Kos</h1>
        <p className="mb-6 mt-2 text-sm text-gray-500">
          Ceritakan kebutuhanmu, tim kami pilihkan kos terbaik untukmu.
        </p>
        <RecommendationForm />
      </main>
    </div>
  )
}