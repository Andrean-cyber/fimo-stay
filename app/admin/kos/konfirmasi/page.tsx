import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { confirmKosAvailability, confirmKosAvailabilityBulk } from '../actions'
import { EmptyState } from '@/components/empty-state'
import { CheckCircle } from 'lucide-react'
import { KonfirmasiKosRealtimeRefresh } from './realtime-refresh'
import { ConfirmSubmitButton } from './confirm-submit-button'
import { Pagination } from '@/components/pagination'

const THRESHOLD_DAYS = 5
const OWNERS_PER_PAGE = 10

export default async function KonfirmasiKosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  await requireAdmin()

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const thresholdDate = new Date(Date.now() - THRESHOLD_DAYS * 24 * 60 * 60 * 1000)
  const where = {
    status: { in: ['ACTIVE', 'HIDDEN_STALE'] as const },
    lastUpdatedAt: { lt: thresholdDate },
  }

  // Langkah 1: cari owner mana saja yang punya kos butuh konfirmasi.
  // Diurutkan dari kos yang paling lama belum di-update per owner,
  // supaya owner dengan kasus paling "mendesak" tampil duluan —
  // ini menggantikan orderBy: { lastUpdatedAt: 'asc' } yang lama,
  // tapi di level owner, bukan di level kos.
  const ownerGroups = await prisma.kos.groupBy({
    by: ['ownerId'],
    where,
    _min: { lastUpdatedAt: true },
    orderBy: { _min: { lastUpdatedAt: 'asc' } },
  })

  const totalOwners = ownerGroups.length
  const totalPages = Math.max(1, Math.ceil(totalOwners / OWNERS_PER_PAGE))
  const pagedOwnerIds = ownerGroups
    .slice((page - 1) * OWNERS_PER_PAGE, page * OWNERS_PER_PAGE)
    .map((g) => g.ownerId)

  // Langkah 2: ambil detail kos HANYA untuk owner-owner di halaman ini,
  // jadi tidak ada owner yang grouping-nya terpotong antar halaman.
  const kosList = pagedOwnerIds.length
    ? await prisma.kos.findMany({
        where: { ...where, ownerId: { in: pagedOwnerIds } },
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
    : []

  const grouped = new Map<string, { owner: (typeof kosList)[number]['owner']; items: typeof kosList }>()
  for (const kos of kosList) {
    if (!grouped.has(kos.owner.id)) grouped.set(kos.owner.id, { owner: kos.owner, items: [] })
    grouped.get(kos.owner.id)!.items.push(kos)
  }
  // Urutan group mengikuti urutan pagedOwnerIds (hasil groupBy langkah 1),
  // bukan urutan kemunculan di kosList.
  const groups = pagedOwnerIds
    .map((id) => grouped.get(id))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))

  const now = Date.now()
  const buildHref = (p: number) => `/admin/kos/konfirmasi?page=${p}`

  return (
    <div className="space-y-6">
      <KonfirmasiKosRealtimeRefresh />

      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl">Konfirmasi Kos</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {totalOwners === 0
            ? 'Tidak ada kos yang perlu dikonfirmasi saat ini.'
            : `${totalOwners} owner perlu dikonfirmasi`}
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Semua kos sudah up to date"
          description="Tidak ada yang mendekati auto-hide dalam waktu dekat."
        />
      ) : (
        <>
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
                      <ConfirmSubmitButton
                        label={`Konfirmasi Semua (${items.length})`}
                        pendingLabel="Mengonfirmasi semua..."
                        variant="solid"
                      />
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
                          <ConfirmSubmitButton />
                        </form>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  )
}
