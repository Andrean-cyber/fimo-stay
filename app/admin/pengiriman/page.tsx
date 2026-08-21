import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { getReferenceCode } from '@/lib/constants'
import { PengirimanLiveBanner } from '@/components/admin/pengiriman-live-banner'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { fetchSelfSearchPage, fetchRecommendationPage, PAGE_SIZE } from './queue-helpers'
import { loadMoreSelfSearch, loadMoreRecommendation } from './actions'
import { QueueSection } from './queue-section'

export default async function PengirimanPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdmin()
  const { q: rawQ = '' } = await searchParams
  const q = rawQ.trim()

  const selfSearchWhere = { status: 'VERIFIED' as const, type: 'SELF_SEARCH' as const, sentAt: null }
  const recommendationWhere = {
    status: 'VERIFIED' as const,
    type: 'RECOMMENDATION' as const,
    sentAt: null,
    recommendationItems: { some: {} },
  }

  const [
    selfSearchQueue,
    recommendationQueue,
    selfSearchTotal,
    recommendationTotal,
    recentlySent,
    searchResults,
  ] = await Promise.all([
    fetchSelfSearchPage(0, PAGE_SIZE),
    fetchRecommendationPage(0, PAGE_SIZE),
    prisma.transaction.count({ where: selfSearchWhere }),
    prisma.transaction.count({ where: recommendationWhere }),
    q
      ? Promise.resolve([])
      : prisma.transaction.findMany({
          where: { status: 'VERIFIED', sentAt: { not: null } },
          include: { searcher: true },
          orderBy: { sentAt: 'desc' },
          take: 15,
        }),
    q
      ? prisma.transaction.findMany({
          where: {
            sentAt: { not: null },
            OR: [
              { id: { startsWith: q.toLowerCase() } },
              { searcher: { phone: { contains: q } } },
            ],
          },
          include: { searcher: true, targetKos: true },
          orderBy: { sentAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
  ])

  const totalQueue = selfSearchTotal + recommendationTotal

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Kirim Detail Kos</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {totalQueue > 0
            ? `${totalQueue} transaksi siap dikirim ke WhatsApp pencari`
            : 'Tidak ada transaksi yang perlu dikirim'}
        </p>
      </div>

      <PengirimanLiveBanner />

      <form className="flex max-w-lg gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari riwayat terkirim: kode referensi atau nomor HP..."
            className="w-full rounded-xl border border-fimo-gray py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30 lg:py-3 lg:text-[15px]"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-fimo-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 lg:py-3 lg:text-[15px]"
        >
          Cari
        </button>
      </form>

      {q && (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <div className="border-b border-fimo-gray px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Hasil Pencarian Riwayat Terkirim</h2>
            <p className="text-xs text-gray-500">
              {searchResults.length > 0
                ? `${searchResults.length} transaksi ditemukan untuk "${q}"`
                : `Tidak ada transaksi terkirim ditemukan untuk "${q}"`}
            </p>
          </div>

          {searchResults.length > 0 && (
            <ul className="divide-y divide-fimo-gray">
              {searchResults.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">{getReferenceCode(t.id)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${t.type === 'SELF_SEARCH' ? 'bg-fimo-gray text-gray-600' : 'bg-fimo-navy/10 text-fimo-navy'}`}>
                        {t.type === 'SELF_SEARCH' ? 'Cari Sendiri' : 'Rekomendasi'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-gray-700 lg:text-[15px]">
                      {t.searcher.phone}
                      {t.targetKos && <span className="text-gray-400"> — {t.targetKos.name}</span>}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{t.sentAt?.toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-3">
        {totalQueue === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-fimo-gray bg-white px-5 py-10 text-center">
            <div className="rounded-full bg-fimo-blue/10 p-3">
              <CheckIcon className="h-5 w-5 text-fimo-blue" />
            </div>
            <p className="text-sm text-gray-500">Semua sudah terkirim.</p>
          </div>
        ) : (
          <>
            <QueueSection initialItems={selfSearchQueue} total={selfSearchTotal} loadMore={loadMoreSelfSearch} />
            <QueueSection initialItems={recommendationQueue} total={recommendationTotal} loadMore={loadMoreRecommendation} />
          </>
        )}
      </div>

      {!q && recentlySent.length > 0 && (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <div className="border-b border-fimo-gray px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Riwayat Terkirim</h2>
            <p className="text-xs text-gray-500">15 pengiriman terakhir</p>
          </div>
          <ul className="divide-y divide-fimo-gray">
            {recentlySent.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{getReferenceCode(t.id)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${t.type === 'SELF_SEARCH' ? 'bg-fimo-gray text-gray-600' : 'bg-fimo-navy/10 text-fimo-navy'}`}>
                      {t.type === 'SELF_SEARCH' ? 'Cari Sendiri' : 'Rekomendasi'}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-700 lg:text-[15px]">{t.searcher.phone}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{t.sentAt?.toLocaleString('id-ID')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}