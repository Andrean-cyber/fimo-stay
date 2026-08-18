import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { getReferenceCode } from '@/lib/constants'
import { buildWaLink } from '@/lib/whatsapp'
import { formatSelfSearchMessage, formatRecommendationMessage, type KosMessageDetail } from '@/lib/format-kos-message'
import { markTransactionSent } from './actions'
import { PengirimanLiveBanner } from '@/components/admin/pengiriman-live-banner'
import { ChatBubbleLeftRightIcon, CheckIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatPreferenceSummary } from '@/lib/format-preference'

const QUEUE_LIMIT = 50

const kosDetailInclude = {
  owner: {
    select: { name: true, phone: true },
  },
  segments: {
    select: {
      name: true,
      kosType: { select: { name: true } },
      roomTypes: {
        where: { isActive: true },
        select: {
          name: true,
          priceMonthly: true,
          availableRooms: true,
          description: true,
          facilities: true,
        },
      },
    },
  },
  nearby: {
    where: { isActive: true },
    orderBy: { order: 'asc' as const },
    select: { name: true, distanceText: true },
  },
} as const

type RawKos = {
  name: string
  description: string | null
  city: string
  district: string | null
  address: string
  facilities: string[]
  owner: { name: string; phone: string }
  segments: {
    name: string | null
    kosType: { name: string }
    roomTypes: { name: string; priceMonthly: number; availableRooms: number | null; description: string | null; facilities: string[] }[]
  }[]
  nearby: { name: string; distanceText: string }[]
}

function toKosMessageDetail(kos: RawKos): KosMessageDetail {
  return {
    name: kos.name,
    description: kos.description,
    city: kos.city,
    district: kos.district,
    address: kos.address,
    facilities: kos.facilities,
    ownerName: kos.owner.name,
    ownerPhone: kos.owner.phone,
    segments: kos.segments.map((s) => ({
      name: s.name,
      kosTypeName: s.kosType.name,
      roomTypes: s.roomTypes,
    })),
    nearby: kos.nearby,
  }
}

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
    prisma.transaction.findMany({
      where: selfSearchWhere,
      include: { searcher: true, targetKos: { include: kosDetailInclude } },
      orderBy: { verifiedAt: 'asc' },
      take: QUEUE_LIMIT,
    }),
    prisma.transaction.findMany({
      where: recommendationWhere,
      include: {
        searcher: true,
        recommendationItems: { orderBy: { order: 'asc' }, include: { kos: { include: kosDetailInclude } } },
      },
      orderBy: { verifiedAt: 'asc' },
      take: QUEUE_LIMIT,
    }),
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
  const shownQueue = selfSearchQueue.length + recommendationQueue.length
  const sisaQueue = totalQueue - shownQueue

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Kirim Detail Kos</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {totalQueue > 0
            ? `${totalQueue} transaksi siap dikirim ke WhatsApp pencari${sisaQueue > 0 ? ` (menampilkan ${shownQueue} terlama)` : ''}`
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
            {selfSearchQueue.map((t) => {
              if (!t.targetKos) return null
              const message = formatSelfSearchMessage(t.id, toKosMessageDetail(t.targetKos))
              return (
                <PengirimanCard
                  key={t.id}
                  transactionId={t.id}
                  badgeLabel="Cari Sendiri"
                  badgeClass="bg-fimo-gray text-gray-600"
                  refCode={getReferenceCode(t.id)}
                  phone={t.searcher.phone}
                  subtitle={t.targetKos.name}
                  message={message}
                  waLink={buildWaLink(t.searcher.phone, message)}
                />
              )
            })}

            {recommendationQueue.map((t) => {
              const kosList = t.recommendationItems.map((r) => toKosMessageDetail(r.kos))
              const preferenceSummary = formatPreferenceSummary(t.preferenceNotes)
              const message = formatRecommendationMessage(t.id, preferenceSummary, kosList)
              return (
                <PengirimanCard
                  key={t.id}
                  transactionId={t.id}
                  badgeLabel="Rekomendasi"
                  badgeClass="bg-fimo-navy/10 text-fimo-navy"
                  refCode={getReferenceCode(t.id)}
                  phone={t.searcher.phone}
                  subtitle={`${kosList.length} kos${preferenceSummary ? ` — ${preferenceSummary}` : ''}`}
                  message={message}
                  waLink={buildWaLink(t.searcher.phone, message)}
                />
              )
            })}

            {sisaQueue > 0 && (
              <div className="rounded-2xl border border-dashed border-fimo-gray bg-white px-5 py-4 text-center text-sm text-gray-500">
                Masih ada {sisaQueue} transaksi lagi di antrian. Tandai yang di atas sebagai terkirim untuk memunculkan berikutnya.
              </div>
            )}
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

function PengirimanCard({
  transactionId, badgeLabel, badgeClass, refCode, phone, subtitle, message, waLink,
}: {
  transactionId: string; badgeLabel: string; badgeClass: string; refCode: string
  phone: string; subtitle: string; message: string; waLink: string
}) {
  return (
    <div className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>{badgeLabel}</span>
          <span className="font-mono text-xs text-gray-400">{refCode}</span>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-700 lg:text-[15px]">
        <p><span className="text-gray-400">Pencari:</span> {phone}</p>
        <p className="flex items-start gap-1">
          <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{subtitle}</span>
        </p>
      </div>

      <details className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <summary className="cursor-pointer select-none font-medium text-gray-700">Pratinjau pesan</summary>
        <pre className="mt-2 whitespace-pre-wrap font-sans">{message}</pre>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
       <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 lg:px-5 lg:py-2.5 lg:text-[15px]"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
          Buka WhatsApp
        </a>
        <form action={markTransactionSent.bind(null, transactionId)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-fimo-gray/40 lg:px-5 lg:py-2.5 lg:text-[15px]"
          >
            <CheckIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            Tandai Terkirim
          </button>
        </form>
      </div>
    </div>
  )
}