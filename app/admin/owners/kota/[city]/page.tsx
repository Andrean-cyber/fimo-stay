import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { ChevronLeftIcon, MapPinIcon, MagnifyingGlassIcon, PhoneIcon, UsersIcon } from '@heroicons/react/24/outline'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteOwner } from '../../actions'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'

const PAGE_SIZE = 20

export default async function OwnersByCityPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  await requireAdmin()

  const { city: rawCity } = await params
  const city = decodeURIComponent(rawCity)
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const query = (q ?? '').trim()

  // Ambil semua kos di kota ini beserta ownernya, lalu grouping per owner
  // di JS. Jumlah kos per kota biasanya kecil, jadi ini tetap ringan;
  // kalau nanti makin besar, bisa dipindah ke query groupBy + cache
  // seperti pola di halaman Kos.
  const kosInCity = await prisma.kos.findMany({
    where: { city },
    orderBy: { owner: { name: 'asc' } },
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          _count: { select: { kos: true } },
        },
      },
    },
  })

  type Grouped = {
    owner: (typeof kosInCity)[number]['owner']
    kosNames: string[]
  }
  const grouped = new Map<string, Grouped>()
  for (const kos of kosInCity) {
    if (!grouped.has(kos.owner.id)) grouped.set(kos.owner.id, { owner: kos.owner, kosNames: [] })
    grouped.get(kos.owner.id)!.kosNames.push(kos.name)
  }

  let owners = [...grouped.values()]

  if (query) {
    const q2 = query.toLowerCase()
    owners = owners.filter(
      (o) =>
        o.owner.name.toLowerCase().includes(q2) ||
        o.owner.phone.toLowerCase().includes(q2) ||
        o.kosNames.some((n) => n.toLowerCase().includes(q2))
    )
  }

  const total = owners.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)
  const pagedOwners = owners.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const buildHref = (p: number) => {
    const params2 = new URLSearchParams()
    if (query) params2.set('q', query)
    params2.set('page', String(p))
    return `/admin/owners/kota/${encodeURIComponent(city)}?${params2.toString()}`
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/owners" className="flex items-center gap-1 text-sm text-gray-500 hover:text-fimo-navy">
        <ChevronLeftIcon className="h-4 w-4" />
        Semua Kota
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-fimo-navy sm:text-2xl">
          <MapPinIcon className="h-5 w-5" />
          {city}
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {total === 0 ? '0 owner' : `Menampilkan ${start}–${end} dari ${total} owner`}
        </p>
      </div>

      <form
        action={`/admin/owners/kota/${encodeURIComponent(city)}`}
        method="get"
        className="flex max-w-sm gap-2"
      >
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={`Cari nama, telepon, atau kos di ${city}...`}
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

      {pagedOwners.length === 0 ? (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <EmptyState
            icon={UsersIcon}
            title={query ? 'Owner tidak ditemukan' : `Belum ada owner di ${city}`}
            description={
              query
                ? `Tidak ada yang cocok dengan "${query}".`
                : 'Owner akan muncul di sini setelah punya kos di kota ini.'
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pagedOwners.map(({ owner, kosNames }) => {
              const otherCitiesCount = owner._count.kos - kosNames.length
              return (
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

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-fimo-gray pt-3">
                    {kosNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-fimo-navy/10 px-2.5 py-1 text-xs font-medium text-fimo-navy"
                      >
                        {name}
                      </span>
                    ))}
                    {otherCitiesCount > 0 && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                        +{otherCitiesCount} kos di kota lain
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  )
}
