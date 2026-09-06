import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { MapPin, Plus, Settings, Search, Home, ChevronLeft } from 'lucide-react'
import { SyncSearchButton } from './sync-search-button'
import { EmptyState } from '@/components/empty-state'
import { KosSearchResults } from './kos-search-results'
import { redis, KOS_CITY_COUNTS_CACHE_KEY, KOS_CITY_COUNTS_CACHE_TTL } from '@/lib/redis'

type CityCount = { city: string; count: number; staleCount: number }

export default async function KosListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  await requireAdmin()
  const { page: pageParam, q } = await searchParams
  const query = (q ?? '').trim()

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Daftar Kos</h1>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
        <div className="col-span-2 sm:col-span-1">
          <SyncSearchButton />
        </div>
        <Link
          href="/admin/kos/pengaturan/jenis-kos"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2.5 text-xs font-medium text-fimo-navy transition-colors hover:bg-fimo-gray/30 sm:text-sm"
        >
          <Settings className="h-4 w-4" />
          Jenis Kos
        </Link>
        <Link
          href="/admin/kos/pengaturan/kota"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2.5 text-xs font-medium text-fimo-navy transition-colors hover:bg-fimo-gray/30 sm:text-sm"
        >
          <MapPin className="h-4 w-4" />
          Kelola Kota
        </Link>
        <Link
          href="/admin/kos/new"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-fimo-navy/90 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Kos
        </Link>
      </div>
    </div>
  )

  const searchBar = (
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
  )

  // Mode 2: ada query -> list flat semua kos yang cocok
  if (query) {
    return (
      <div className="space-y-6">
        {header}
        <Link
          href="/admin/kos"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-fimo-navy"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Daftar Kota
        </Link>
        {searchBar}
        <KosSearchResults query={query} page={pageParam} />
      </div>
    )
  }

  // Mode 1: tanpa query -> folder per kota (dengan cache Redis)
  let cityCounts: CityCount[] | null = null
  try {
    cityCounts = await redis.get<CityCount[]>(KOS_CITY_COUNTS_CACHE_KEY)
  } catch {
    cityCounts = null // kalau Redis down, fallback ke query langsung
  }

  if (!cityCounts) {
    const [rawCounts, rawStale] = await Promise.all([
      prisma.kos.groupBy({
        by: ['city'],
        _count: { _all: true },
        orderBy: { city: 'asc' },
      }),
      prisma.kos.groupBy({
        by: ['city'],
        where: { status: 'HIDDEN_STALE' },
        _count: { _all: true },
      }),
    ])

    const staleMap = new Map(rawStale.map((s) => [s.city, s._count._all]))
    cityCounts = rawCounts.map((c) => ({
      city: c.city,
      count: c._count._all,
      staleCount: staleMap.get(c.city) ?? 0,
    }))

    try {
      await redis.set(KOS_CITY_COUNTS_CACHE_KEY, cityCounts, { ex: KOS_CITY_COUNTS_CACHE_TTL })
    } catch {
      // gagal simpan cache bukan masalah fatal, lanjut render seperti biasa
    }
  }

  return (
    <div className="space-y-6">
      {header}
      {searchBar}

      {cityCounts.length === 0 ? (
        <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
          <EmptyState
            icon={Home}
            title="Belum ada kos"
            description="Mulai dengan menambahkan kos pertama."
            actionLabel="+ Tambah Kos"
            actionHref="/admin/kos/new"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cityCounts.map((c) => (
            <Link
              key={c.city}
              href={`/admin/kos/kota/${encodeURIComponent(c.city)}`}
              className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm transition-colors hover:bg-fimo-gray/20"
            >
              <div className="flex items-center justify-between">
                <MapPin className="h-5 w-5 text-fimo-navy" />
                {c.staleCount > 0 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                    {c.staleCount} stale
                  </span>
                )}
              </div>
              <p className="mt-2 truncate font-semibold text-gray-800">{c.city}</p>
              <p className="text-xs text-gray-500">{c.count} kos</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}