import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { getReferenceCode } from '@/lib/constants'
import { TransaksiLiveBanner } from '@/components/admin/transaksi-live-banner'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { fetchPendingPage, fetchVerifiedNeedPickPage, PAGE_SIZE } from './queue-helpers'
import { loadMorePending, loadMoreVerifiedNeedPick } from './actions'
import { PendingQueueSection } from './pending-queue-section'
import { VerifiedNeedPickSection } from './verified-need-pick-section'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu verifikasi',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  VERIFIED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdmin()
  const { q: rawQ = '' } = await searchParams
  const q = rawQ.trim()

  const [pendingAll, pendingTotal, verifiedNeedPick, verifiedNeedPickTotal, searchResults] = await Promise.all([
    fetchPendingPage(0, PAGE_SIZE),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
    fetchVerifiedNeedPickPage(0, PAGE_SIZE),
    prisma.transaction.count({
      where: { status: 'VERIFIED', type: 'RECOMMENDATION', recommendationItems: { none: {} } },
    }),
    q
      ? prisma.transaction.findMany({
          where: {
            OR: [
              { id: { startsWith: q.toLowerCase() } },
              { searcher: { phone: { contains: q } } },
            ],
          },
          include: { searcher: true, targetKos: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Verifikasi Transaksi</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {pendingTotal > 0
            ? `${pendingTotal} transaksi menunggu verifikasi`
            : 'Tidak ada transaksi yang menunggu verifikasi'}
        </p>
      </div>

      <TransaksiLiveBanner />

      <form className="flex max-w-lg gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari kode referensi atau nomor HP..."
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
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Hasil Pencarian Riwayat
            </h2>
            <p className="text-xs text-gray-500">
              {searchResults.length > 0
                ? `${searchResults.length} transaksi ditemukan untuk "${q}"`
                : `Tidak ada transaksi ditemukan untuk "${q}"`}
            </p>
          </div>

          {searchResults.length > 0 && (
            <ul className="divide-y divide-fimo-gray">
              {searchResults.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">{getReferenceCode(t.id)}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[t.status] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-gray-700 lg:text-[15px]">
                      {t.searcher.phone}
                      {t.targetKos && <span className="text-gray-400"> — {t.targetKos.name}</span>}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-fimo-navy lg:text-[15px]">
                    Rp{t.amount.toLocaleString('id-ID')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-3">
        <PendingQueueSection initialItems={pendingAll} total={pendingTotal} loadMore={loadMorePending} />
      </div>

      <VerifiedNeedPickSection
        initialItems={verifiedNeedPick}
        total={verifiedNeedPickTotal}
        loadMore={loadMoreVerifiedNeedPick}
      />
    </div>
  )
}