import Link from 'next/link'
import { Search, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { normalizePhone } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const STATUS_META: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  PENDING: { label: 'Menunggu verifikasi', icon: Clock, className: 'bg-amber-50 text-amber-700' },
  VERIFIED: { label: 'Terverifikasi', icon: CheckCircle2, className: 'bg-green-50 text-green-700' },
  REJECTED: { label: 'Ditolak', icon: XCircle, className: 'bg-red-50 text-red-700' },
}

const TYPE_LABEL: Record<string, string> = {
  SELF_SEARCH: 'Buka Kontak Kos',
  RECOMMENDATION: 'Rekomendasi 3 Kos',
}

export default async function CekStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>
}) {
  const { phone = '' } = await searchParams
  const hasSearched = phone.trim().length > 0
  const normalized = hasSearched ? normalizePhone(phone) : null

  const searcher = normalized
    ? await prisma.searcher.findFirst({
        where: { phone: normalized },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    : null

  const transactions = searcher?.transactions ?? []

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-xl px-4 py-8 md:py-12">
        <h1 className="text-xl font-bold text-fimo-navy md:text-2xl">Cek Status Transaksi</h1>
        <p className="mt-1 text-sm text-gray-500 md:text-base">
          Masukkan nomor HP yang kamu pakai saat checkout untuk melihat riwayat transaksimu.
        </p>

        <form action="/status/cek" method="GET" className="mt-6 flex gap-2">
          <input
            type="tel"
            name="phone"
            defaultValue={phone}
            placeholder="08xxxxxxxxxx"
            required
            className="flex-1 rounded-xl border border-fimo-gray px-4 py-2.5 text-sm outline-none focus:border-fimo-blue md:text-base"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-fimo-navy/90 md:px-5 md:text-base"
          >
            <Search className="h-4 w-4" />
            Cari
          </button>
        </form>

        {hasSearched && (
          <div className="mt-8">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-fimo-gray bg-gray-50 p-5 text-center">
                <p className="text-sm text-gray-600 md:text-base">
                  Tidak ada transaksi yang ditemukan untuk nomor ini.
                </p>
                <p className="mt-1 text-xs text-gray-400 md:text-sm">
                  Pastikan nomor HP yang kamu masukkan sama persis dengan yang dipakai saat checkout.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 md:text-sm">
                  {transactions.length} transaksi ditemukan
                </p>
                {transactions.map((trx) => {
                  const meta = STATUS_META[trx.status] ?? STATUS_META.PENDING
                  const Icon = meta.icon
                  return (
                    <Link
                      key={trx.id}
                      href={`/status/${trx.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-fimo-gray bg-white p-4 transition-colors hover:border-fimo-blue/50 hover:bg-fimo-blue/5 md:p-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 md:text-base">
                          {TYPE_LABEL[trx.type] ?? trx.type}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 md:text-sm">
                          Rp{trx.amount.toLocaleString('id-ID')} ·{' '}
                          {trx.createdAt.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium md:text-sm ${meta.className}`}
                      >
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
