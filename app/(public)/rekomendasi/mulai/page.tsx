import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { RecommendationForm } from './recommendation-form'

export default async function MintaRekomendasiPage() {
  const kosTypes = await prisma.kosType.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <h1 className="text-xl font-bold text-fimo-navy md:text-2xl">Ceritakan Kos Impianmu</h1>
        <p className="mb-6 mt-2 text-sm text-gray-500 md:text-base">
          Tim kami pilihkan kos terbaik untukmu.
        </p>
        <RecommendationForm kosTypes={kosTypes.map((k) => k.name)} />
      </main>
    </div>
  )
}