import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { PlusIcon, UsersIcon, PhoneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteOwner } from './actions'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'

const PAGE_SIZE = 20

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  await requireAdmin()

  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const query = (q ?? '').trim()

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { phone: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [owners, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        phone: true,
        _count: { select: { kos: true } },
      },
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
    return `/admin/owners?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Daftar Owner</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {total === 0
              ? '0 owner terdaftar'
              : `Menampilkan ${start}–${end} dari ${total} owner`}
          </p>
        </div>
        <Link
          href="/admin/owners/new"
          className="flex items-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-fimo-navy/90 sm:text-sm lg:px-5 lg:py-3 lg:text-[15px]"
        >
          <PlusIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
          Tambah Owner
        </Link>
      </div>

      {/* ===== Search bar ===== */}
<form action="/admin/owners" method="get" className="flex max-w-sm gap-2">
  <div className="relative flex-1">
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      name="q"
      defaultValue={query}
      placeholder="Cari nama atau nomor telepon..."
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
            title={query ? 'Owner tidak ditemukan' : 'Belum ada owner'}
            description={
              query
                ? `Tidak ada owner yang cocok dengan "${query}".`
                : 'Tambahkan owner sebelum bisa menambahkan kos.'
            }
            actionLabel={query ? undefined : '+ Tambah Owner'}
            actionHref={query ? undefined : '/admin/owners/new'}
          />
        </div>
      ) : (
        <>
          {/* ===== Mobile: card list (tampil < md) ===== */}
          <div className="space-y-3 md:hidden">
            {owners.map((o) => (
              <div key={o.id} className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-800">{o.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <PhoneIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{o.phone}</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-fimo-navy/10 px-2.5 py-1 text-xs font-medium text-fimo-navy">
                    {o._count.kos} kos
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-end gap-4 border-t border-fimo-gray pt-3">
                  <Link
                    href={`/admin/owners/${o.id}/edit`}
                    className="text-sm font-medium text-fimo-navy hover:text-fimo-blue"
                  >
                    Edit
                  </Link>
                  <ConfirmDeleteButton action={deleteOwner.bind(null, o.id)} itemName={o.name} />
                </div>
              </div>
            ))}
          </div>

          {/* ===== Desktop: table (tampil >= md) ===== */}
          <div className="hidden overflow-x-auto rounded-2xl border border-fimo-gray bg-white shadow-sm md:block">
            <table className="w-full text-sm lg:text-[15px]">
              <thead>
                <tr className="border-b border-fimo-gray text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">Telepon</th>
                  <th className="px-5 py-3 font-medium">Jumlah Kos</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fimo-gray">
                {owners.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-fimo-gray/30">
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-gray-800">{o.name}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">{o.phone}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="rounded-full bg-fimo-navy/10 px-2.5 py-1 text-xs font-medium text-fimo-navy">
                        {o._count.kos} kos
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/owners/${o.id}/edit`}
                          className="text-sm font-medium text-fimo-navy hover:text-fimo-blue lg:text-[15px]"
                        >
                          Edit
                        </Link>
                        <ConfirmDeleteButton action={deleteOwner.bind(null, o.id)} itemName={o.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  )
}