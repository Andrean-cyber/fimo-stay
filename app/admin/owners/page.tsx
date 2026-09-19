import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import {
  PlusIcon,
  UsersIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteOwner } from './actions'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'

const PAGE_SIZE = 20

type CityOwnerCount = { city: string; ownerCount: number }

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  await requireAdmin()

  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const query = (q ?? '').trim()

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Daftar Owner</h1>
      </div>
      <Link
        href="/admin/owners/new"
        className="flex items-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-fimo-navy/90 sm:text-sm lg:px-5 lg:py-3 lg:text-[15px]"
      >
        <PlusIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
        Tambah Owner
      </Link>
    </div>
  )

  const searchBar = (
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
  )

  // ===== Mode 2: ada query -> flat list semua owner yang cocok, lintas kota =====
  if (query) {
    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } },
      ],
    }

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
      params.set('q', query)
      params.set('page', String(p))
      return `/admin/owners?${params.toString()}`
    }

    return (
      <div className="space-y-6">
        {header}
        <Link href="/admin/owners" className="flex items-center gap-1 text-sm text-gray-500 hover:text-fimo-navy">
          <ChevronLeftIcon className="h-4 w-4" />
          Kembali ke Daftar Kota
        </Link>
        {searchBar}

        {owners.length === 0 ? (
          <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
            <EmptyState
              icon={UsersIcon}
              title="Owner tidak ditemukan"
              description={`Tidak ada owner yang cocok dengan "${query}".`}
            />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 sm:text-sm">
              Menampilkan {start}–{end} dari {total} owner
            </p>

            {/* Mobile: card list */}
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
                    <Link href={`/admin/owners/${o.id}/edit`} className="text-sm font-medium text-fimo-navy hover:text-fimo-blue">
                      Edit
                    </Link>
                    <ConfirmDeleteButton action={deleteOwner.bind(null, o.id)} itemName={o.name} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
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

  // ===== Mode 1: tanpa query -> folder per kota + folder owner tanpa kos =====
  // Owner boleh muncul di lebih dari satu folder kalau punya kos di
  // beberapa kota (sesuai keputusan sebelumnya).
  const [kosOwnerCities, ownerWithoutKosCount] = await Promise.all([
    prisma.kos.findMany({
      select: { city: true, ownerId: true },
    }),
    prisma.owner.count({ where: { kos: { none: {} } } }),
  ])

  const cityOwnerIds = new Map<string, Set<string>>()
  for (const k of kosOwnerCities) {
    if (!cityOwnerIds.has(k.city)) cityOwnerIds.set(k.city, new Set())
    cityOwnerIds.get(k.city)!.add(k.ownerId)
  }

  const cityCounts: CityOwnerCount[] = [...cityOwnerIds.entries()]
    .map(([city, ownerIds]) => ({ city, ownerCount: ownerIds.size }))
    .sort((a, b) => a.city.localeCompare(b.city))

  return (
    <div className="space-y-6">
      {header}
      {searchBar}

      {cityCounts.length === 0 && ownerWithoutKosCount === 0 ? (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <EmptyState
            icon={UsersIcon}
            title="Belum ada owner"
            description="Tambahkan owner dan kos untuk mulai mengelola per kota."
            actionLabel="+ Tambah Owner"
            actionHref="/admin/owners/new"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cityCounts.map((c) => (
            <Link
              key={c.city}
              href={`/admin/owners/kota/${encodeURIComponent(c.city)}`}
              className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm transition-colors hover:bg-fimo-gray/20"
            >
              <MapPinIcon className="h-5 w-5 text-fimo-navy" />
              <p className="mt-2 truncate font-semibold text-gray-800">{c.city}</p>
              <p className="text-xs text-gray-500">{c.ownerCount} owner</p>
            </Link>
          ))}

          {ownerWithoutKosCount > 0 && (
            <Link
              href="/admin/owners/tanpa-kos"
              className="rounded-2xl border border-dashed border-fimo-gray bg-white p-4 shadow-sm transition-colors hover:bg-fimo-gray/20"
            >
              <UsersIcon className="h-5 w-5 text-gray-400" />
              <p className="mt-2 truncate font-semibold text-gray-800">Tanpa Kos</p>
              <p className="text-xs text-gray-500">{ownerWithoutKosCount} owner</p>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}