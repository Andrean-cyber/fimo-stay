import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { verifyTransaction, rejectTransaction } from './actions'
import { getReferenceCode } from '@/lib/constants'
import { TransaksiLiveBanner } from '@/components/admin/transaksi-live-banner'
import Link from 'next/link'
import { MagnifyingGlassIcon, CheckIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { formatPreferenceSummary } from '@/lib/format-preference'

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

  const pendingAll = await prisma.transaction.findMany({
    where: { status: 'PENDING' },
    include: { searcher: true, targetKos: true },
    orderBy: { createdAt: 'asc' },
  })

  const verifiedNeedPick = await prisma.transaction.findMany({
    where: { status: 'VERIFIED', type: 'RECOMMENDATION', recommendationItems: { none: {} } },
    include: { searcher: true },
  })

  const searchResults = q
    ? await prisma.transaction.findMany({
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
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Verifikasi Transaksi</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {pendingAll.length > 0
            ? `${pendingAll.length} transaksi menunggu verifikasi`
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
        {pendingAll.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-fimo-gray bg-white px-5 py-10 text-center">
            <div className="rounded-full bg-fimo-blue/10 p-3">
              <CheckIcon className="h-5 w-5 text-fimo-blue" />
            </div>
            <p className="text-sm text-gray-500">Semua transaksi sudah diverifikasi.</p>
          </div>
        ) : (
          pendingAll.map((t) => {
            const preferenceSummary = formatPreferenceSummary(t.preferenceNotes)
            return (
              <div key={t.id} className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.type === 'SELF_SEARCH' ? 'bg-fimo-gray text-gray-600' : 'bg-fimo-navy/10 text-fimo-navy'
                      }`}
                    >
                      {t.type === 'SELF_SEARCH' ? 'Cari Sendiri' : 'Rekomendasi'}
                    </span>
                    <span className="font-mono text-xs text-gray-400">{getReferenceCode(t.id)}</span>
                  </div>
                  <span className="text-lg font-bold text-fimo-navy sm:text-xl lg:text-2xl">
                    Rp{t.amount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-700 lg:text-[15px]">
                  <p>
                    <span className="text-gray-400">Pencari:</span> {t.searcher.phone}
                  </p>
                  {t.targetKos && (
                    <p>
                      <span className="text-gray-400">Target kos:</span> {t.targetKos.name}
                    </p>
                  )}
                  {preferenceSummary && (
                    <p>
                      <span className="text-gray-400">Preferensi:</span> {preferenceSummary}
                    </p>
                  )}
                </div>

                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Cocokkan kode referensi di atas dengan pesan WhatsApp sebelum verifikasi
                </p>

                <div className="mt-4 flex gap-2">
                  <form action={verifyTransaction.bind(null, t.id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 lg:px-5 lg:py-2.5 lg:text-[15px]"
                    >
                      <CheckIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                      Verifikasi
                    </button>
                  </form>
                  <form action={rejectTransaction.bind(null, t.id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 lg:px-5 lg:py-2.5 lg:text-[15px]"
                    >
                      <XMarkIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                      Tolak
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        )}
      </div>

      {verifiedNeedPick.length > 0 && (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <div className="border-b border-fimo-gray px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Perlu Dipilihkan Rekomendasi</h2>
            <p className="text-xs text-gray-500">{verifiedNeedPick.length} transaksi menunggu dipilihkan kos</p>
          </div>
          <ul className="divide-y divide-fimo-gray">
            {verifiedNeedPick.map((t) => {
              const preferenceSummary = formatPreferenceSummary(t.preferenceNotes)
              return (
                <li key={t.id}>
                  <Link
                    href={`/admin/transaksi/${t.id}/pilih-rekomendasi`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-fimo-gray/40 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 lg:text-[15px]">{t.searcher.phone}</p>
                      <p className="truncate text-xs text-gray-500">
                        {preferenceSummary || 'Tanpa catatan preferensi'}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-fimo-navy lg:text-[15px]">
                      Pilih 3 Kos
                      <ArrowRightIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}