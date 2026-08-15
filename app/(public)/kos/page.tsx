import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { SearchForm } from './search-form'
import { EmptyState } from '@/components/empty-state'
import { SearchX } from 'lucide-react'
import { KosCard } from '@/components/kos-card'
import { toPublicUrl } from '@/lib/r2'
import type { Prisma } from '@prisma/client'

export default async function KosSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  const where: Prisma.KosWhereInput = {
    status: 'ACTIVE',
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { district: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const kosListRaw = await prisma.kos.findMany({
    where,
    orderBy: { lastUpdatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      facilities: true,
      segments: {
        select: {
          kosType: { select: { name: true } },
          roomTypes: {
            where: { isActive: true },
            select: { priceMonthly: true },
          },
        },
      },
      media: {
        orderBy: [{ isCover: 'desc' }, { order: 'asc' }],
        take: 1,
        select: { url: true },
      },
      nearby: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 1,
        select: { name: true, distanceText: true },
      },
    },
  })

  // Kos tanpa room type aktif dikeluarkan — sama seperti logika lama di
  // syncKosToIndex, supaya tidak tampil dengan harga kosong/ngaco
  const kosList = kosListRaw
    .map((k) => {
      const allPrices = k.segments.flatMap((s) => s.roomTypes.map((rt) => rt.priceMonthly))
      if (allPrices.length === 0) return null

      const nearby = k.nearby[0]
      return {
        id: k.id,
        slug: k.slug,
        name: k.name,
        city: k.city,
        facilities: k.facilities,
        priceMin: Math.min(...allPrices),
        priceMax: Math.max(...allPrices),
        roomType: k.segments[0]?.kosType.name ?? null,
        imageUrl: k.media[0]?.url ? toPublicUrl(k.media[0].url) : null,
        nearbyText: nearby ? `${nearby.distanceText} ke ${nearby.name}` : null,
      }
    })
    .filter((k): k is NonNullable<typeof k> => k !== null)

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <SearchForm defaultQuery={q} />
        </div>

        <p className="mb-4 text-sm text-gray-500 md:text-base">
          {kosList.length} kos ditemukan
          {q && (
            <>
              {' '}untuk <span className="font-medium text-gray-700">&ldquo;{q}&rdquo;</span>
            </>
          )}
        </p>

        {kosList.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ditemukan"
            description="Coba kata kunci lain, atau minta rekomendasi dari tim kami."
            actionLabel="Minta Rekomendasi"
            actionHref="/rekomendasi/mulai"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {kosList.map((kos) => (
              <KosCard
                key={kos.id}
                slug={kos.slug}
                name={kos.name}
                city={kos.city}
                priceMonthly={kos.priceMin}
                priceMax={kos.priceMax}
                roomType={kos.roomType}
                facilities={kos.facilities}
                imageUrl={kos.imageUrl}
                nearbyText={kos.nearbyText}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}