import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { ChevronLeftIcon, MagnifyingGlassIcon, PhoneIcon, UsersIcon } from '@heroicons/react/24/outline'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteOwner } from '../actions'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'

const PAGE_SIZE = 20

export default async function OwnersWithoutKosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  await requireAdmin()

  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const query = (q ?? '').trim()

  const where = {
    kos: { none: {} },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { phone: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [owners, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, phone: true },
    }),
    prisma.owner.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    params.set('page', String(p))
    return `/admin/owners/tanpa-kos?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/owners" className="flex items-center gap-1 text-sm text-gray-500 hover:text-fimo-navy">
        <ChevronLeftIcon className="h-4 w-4" />
        Semua Kota
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-fimo-navy sm:text-2xl">
          <UsersIcon className="h-5 w-5" />
          Owner Tanpa Kos
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {total === 0 ? '0 owner' : `Menampilkan ${start}–${end} dari ${total} owner`}
        </p>
      </div>

      <form action="/admin/owners/tanpa-kos" method="get" className="flex max-w-sm gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari nama atau telepon..."
            className="w-full rounded-xl border border-fimo-gray py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90"
        >
          Cari
        </button>
      </form>

      {owners.length === 0 ? (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <EmptyState
            icon={UsersIcon}
            title={query ? 'Owner tidak ditemukan' : 'Belum ada owner tanpa kos'}
            description={
              query
                ? `Tidak ada yang cocok dengan "${query}".`
                : 'Semua owner saat ini sudah punya minimal satu kos.'
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {owners.map((owner) => (
              <div key={owner.id} className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <PhoneIcon className="h-3 w-3 shrink-0" />
                      <span>{owner.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/owners/${owner.id}/edit`}
                      className="text-sm font-medium text-fimo-navy hover:text-fimo-blue"
                    >
                      Edit
                    </Link>
                    <ConfirmDeleteButton action={deleteOwner.bind(null, owner.id)} itemName={owner.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  )
}