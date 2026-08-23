import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { confirmKosAvailability, confirmKosAvailabilityBulk } from '../actions'
import { EmptyState } from '@/components/empty-state'
import { CheckCircle } from 'lucide-react'
import { KonfirmasiKosRealtimeRefresh } from './realtime-refresh'

const THRESHOLD_DAYS = 5

export default async function KonfirmasiKosPage() {
  await requireAdmin()

  const thresholdDate = new Date(Date.now() - THRESHOLD_DAYS * 24 * 60 * 60 * 1000)

  const kosList = await prisma.kos.findMany({
    where: {
      status: { in: ['ACTIVE', 'HIDDEN_STALE'] },
      lastUpdatedAt: { lt: thresholdDate },
    },
    orderBy: { lastUpdatedAt: 'asc' },
    select: {
      id: true,
      name: true,
      city: true,
      status: true,
      lastUpdatedAt: true,
      owner: { select: { id: true, name: true, phone: true } },
    },
  })

  const grouped = new Map<string, { owner: (typeof kosList)[number]['owner']; items: typeof kosList }>()
  for (const kos of kosList) {
    if (!grouped.has(kos.owner.id)) grouped.set(kos.owner.id, { owner: kos.owner, items: [] })
    grouped.get(kos.owner.id)!.items.push(kos)
  }
  const groups = [...grouped.values()]
  const now = Date.now()

  return (
    <div className="space-y-6">
      <KonfirmasiKosRealtimeRefresh />

      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl">Konfirmasi Kos</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {kosList.length === 0
            ? 'Tidak ada kos yang perlu dikonfirmasi saat ini.'
            : `${kosList.length} kos dari ${groups.length} owner perlu dikonfirmasi`}
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Semua kos sudah up to date"
          description="Tidak ada yang mendekati auto-hide dalam waktu dekat."
        />
      ) : (
        <div className="space-y-4">
          {groups.map(({ owner, items }) => (
            <div key={owner.id} className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                  <p className="text-xs text-gray-500">{owner.phone}</p>
                </div>
                {items.length > 1 && (
                  <form action={confirmKosAvailabilityBulk.bind(null, items.map((k) => k.id))}>
                    <button
                      type="submit"
                      className="rounded-xl bg-fimo-navy px-3.5 py-2 text-xs font-medium text-white hover:bg-fimo-navy/90"
                    >
                      Konfirmasi Semua ({items.length})
                    </button>
                  </form>
                )}
              </div>

              <ul className="divide-y divide-fimo-gray">
                {items.map((kos) => {
                  const hari = Math.floor((now - kos.lastUpdatedAt.getTime()) / 86400000)
                  const isStale = kos.status === 'HIDDEN_STALE'
                  return (
                    <li key={kos.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-800">{kos.name}</p>
                        <p className="text-xs text-gray-500">
                          {kos.city} — {hari} hari lalu{isStale ? ' · sudah disembunyikan' : ''}
                        </p>
                      </div>
                      <form action={confirmKosAvailability.bind(null, kos.id)}>
                        <button
                          type="submit"
                          className="shrink-0 rounded-xl border border-fimo-gray px-3 py-1.5 text-xs font-medium text-fimo-navy hover:bg-fimo-gray/30"
                        >
                          Konfirmasi
                        </button>
                      </form>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}