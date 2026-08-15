import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { verifyTransaction, rejectTransaction } from './actions'
import { getReferenceCode } from '@/lib/constants'
import Link from 'next/link'
import { Search, Check, X, ArrowRight } from 'lucide-react'

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

  const pending = q
    ? pendingAll.filter((t) => {
        const code = getReferenceCode(t.id)
        return (
          code.toUpperCase().includes(q.toUpperCase()) ||
          t.searcher.phone.includes(q)
        )
      })
    : pendingAll

  const verifiedNeedPick = await prisma.transaction.findMany({
    where: { status: 'VERIFIED', type: 'RECOMMENDATION', recommendationItems: { none: {} } },
    include: { searcher: true },
  })

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

      <form className="flex max-w-lg gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

      {/* Daftar pending */}
      <div className="space-y-3">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-fimo-gray bg-white px-5 py-10 text-center">
            {q ? (
              <>
                <div className="rounded-full bg-gray-100 p-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Tidak ada transaksi pending yang cocok dengan &quot;{q}&quot;.
                </p>
                <p className="text-xs text-gray-400">
                  Transaksi ini mungkin belum dibuat, sudah diverifikasi/ditolak sebelumnya, atau kode/nomor HP salah ketik.
                </p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-fimo-blue/10 p-3">
                  <Check className="h-5 w-5 text-fimo-blue" />
                </div>
                <p className="text-sm text-gray-500">Semua transaksi sudah diverifikasi.</p>
              </>
            )}
          </div>
        ) : (
          pending.map((t) => (
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
                {t.preferenceNotes && (
                  <p>
                    <span className="text-gray-400">Preferensi:</span> {t.preferenceNotes}
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
                    <Check className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                    Verifikasi
                  </button>
                </form>
                <form action={rejectTransaction.bind(null, t.id)}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 lg:px-5 lg:py-2.5 lg:text-[15px]"
                  >
                    <X className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                    Tolak
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Perlu dipilihkan rekomendasi */}
      {verifiedNeedPick.length > 0 && (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <div className="border-b border-fimo-gray px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Perlu Dipilihkan Rekomendasi</h2>
            <p className="text-xs text-gray-500">{verifiedNeedPick.length} transaksi menunggu dipilihkan kos</p>
          </div>
          <ul className="divide-y divide-fimo-gray">
            {verifiedNeedPick.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/admin/transaksi/${t.id}/pilih-rekomendasi`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-fimo-gray/40 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 lg:text-[15px]">{t.searcher.phone}</p>
                    <p className="truncate text-xs text-gray-500">{t.preferenceNotes}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-fimo-navy lg:text-[15px]">
                    Pilih 3 Kos
                    <ArrowRight className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
