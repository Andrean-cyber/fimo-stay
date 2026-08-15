import { PublicHeader } from '@/components/public-header'
import { RecommendationForm } from './recommendation-form'

export default function MintaRekomendasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-lg px-4 py-12 md:py-16">
        <h1 className="text-xl font-bold text-fimo-navy md:text-2xl">Minta Rekomendasi Kos</h1>
        <p className="mb-6 mt-2 text-sm text-gray-500 md:text-base">
          Ceritakan kebutuhanmu, tim kami pilihkan kos terbaik untukmu.
        </p>
        <RecommendationForm />
      </main>
    </div>
  )
}
