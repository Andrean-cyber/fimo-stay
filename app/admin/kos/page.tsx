import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { SyncSearchButton } from './sync-search-button'
import { Plus, AlertTriangle, Home, Settings, MapPin, User, Search } from 'lucide-react'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteKos } from './actions'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Aktif',
  HIDDEN_STALE: 'Disembunyikan (Stale)',
  HIDDEN_MANUAL: 'Disembunyikan (Manual)',
}

const PAGE_SIZE = 20

export default async function KosListPage({
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
          { city: { contains: query, mode: 'insensitive' as const } },
          { owner: { name: { contains: query, mode: 'insensitive' as const } } },
        ],
      }
    : {}

  const [daftarKos, total] = await Promise.all([
    prisma.kos.findMany({
      where,
      orderBy: { lastUpdatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        lastUpdatedAt: true,
        owner: { select: { name: true } },
      },
    }),
    prisma.kos.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    params.set('page', String(p))
    return `/admin/kos?${params.toString()}`
  }

  const now = Date.now()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Daftar Kos</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {total === 0 ? '0 kos terdaftar' : `Menampilkan ${start}–${end} dari ${total} kos`}
          </p>
        </div>
        {/* Actions: full-width stack di mobile, inline di desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="col-span-2 sm:col-span-1">
            <SyncSearchButton />
          </div>
          <Link
            href="/admin/kos/pengaturan/jenis-kos"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2.5 text-xs font-medium text-fimo-navy transition-colors hover:bg-fimo-gray/30 sm:text-sm lg:px-5 lg:py-3 lg:text-[15px]"
          >
            <Settings className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            Jenis Kos
          </Link>
          <Link
            href="/admin/kos/new"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-fimo-navy/90 sm:text-sm lg:px-5 lg:py-3 lg:text-[15px]"
          >
            <Plus className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            Tambah Kos
          </Link>
        </div>
      </div>

      {/* ===== Search bar ===== */}
      <form action="/admin/kos" method="get" className="flex max-w-sm gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari nama, kota, atau owner..."
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

      {daftarKos.length === 0 ? (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <EmptyState
            icon={Home}
            title={query ? 'Kos tidak ditemukan' : 'Belum ada kos'}
            description={
              query
                ? `Tidak ada kos yang cocok dengan "${query}".`
                : 'Mulai dengan menambahkan kos pertama.'
            }
            actionLabel={query ? undefined : '+ Tambah Kos'}
            actionHref={query ? undefined : '/admin/kos/new'}
          />
        </div>
      ) : (
        <>
          {/* ===== Mobile: card list (tampil < md) ===== */}
          <div className="space-y-3 md:hidden">
            {daftarKos.map((kos) => {
              const hari = Math.floor((now - kos.lastUpdatedAt.getTime()) / 86400000)
              const warning = hari >= 5 && kos.status === 'ACTIVE'
              const isStale = kos.status === 'HIDDEN_STALE'
              const isHiddenManual = kos.status === 'HIDDEN_MANUAL'

              return (
                <div
                  key={kos.id}
                  className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-800">{kos.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{kos.city}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{kos.owner.name}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isStale
                          ? 'bg-red-50 text-red-600'
                          : isHiddenManual
                            ? 'bg-fimo-gray text-gray-600'
                            : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {STATUS_LABEL[kos.status] ?? kos.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-fimo-gray pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Update {hari} hari lalu</span>
                      {warning && (
                        <span className="flex items-center gap-1 font-medium text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          {hari} hari
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/kos/${kos.id}/edit`}
                        className="text-sm font-medium text-fimo-navy hover:text-fimo-blue"
                      >
                        Edit
                      </Link>
                      <ConfirmDeleteButton action={deleteKos.bind(null, kos.id)} itemName={kos.name} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ===== Desktop: table (tampil >= md) ===== */}
          <div className="hidden overflow-x-auto rounded-2xl border border-fimo-gray bg-white shadow-sm md:block">
            <table className="w-full text-sm lg:text-[15px]">
              <thead>
                <tr className="border-b border-fimo-gray text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">Kota</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Update Terakhir</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fimo-gray">
                {daftarKos.map((kos) => {
                  const hari = Math.floor((now - kos.lastUpdatedAt.getTime()) / 86400000)
                  const warning = hari >= 5 && kos.status === 'ACTIVE'
                  const isStale = kos.status === 'HIDDEN_STALE'
                  const isHiddenManual = kos.status === 'HIDDEN_MANUAL'

                  return (
                    <tr key={kos.id} className="transition-colors hover:bg-fimo-gray/30">
                      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-gray-800">{kos.name}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">{kos.city}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">{kos.owner.name}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              isStale
                                ? 'bg-red-50 text-red-600'
                                : isHiddenManual
                                  ? 'bg-fimo-gray text-gray-600'
                                  : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {STATUS_LABEL[kos.status] ?? kos.status}
                          </span>
                          {warning && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                              <AlertTriangle className="h-3 w-3" />
                              {hari} hari
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">{hari} hari lalu</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/kos/${kos.id}/edit`}
                            className="text-sm font-medium text-fimo-navy hover:text-fimo-blue lg:text-[15px]"
                          >
                            Edit
                          </Link>
                          <ConfirmDeleteButton action={deleteKos.bind(null, kos.id)} itemName={kos.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  )
}