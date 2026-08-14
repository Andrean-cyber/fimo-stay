import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { SyncSearchButton } from './sync-search-button'
import { Plus, AlertTriangle, Home, Settings } from 'lucide-react'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteKos } from './actions'
import { EmptyState } from '@/components/empty-state'

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Aktif',
  HIDDEN_STALE: 'Disembunyikan (Stale)',
  HIDDEN_MANUAL: 'Disembunyikan (Manual)',
}

export default async function KosListPage() {
  await requireAdmin()

  const daftarKos = await prisma.kos.findMany({
    orderBy: { lastUpdatedAt: 'desc' },
    include: { owner: true },
  })

  const now = Date.now()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fimo-navy">Daftar Kos</h1>
          <p className="mt-1 text-sm text-gray-500">{daftarKos.length} kos terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncSearchButton />
          <Link
            href="/admin/kos/pengaturan/jenis-kos"
            className="flex items-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2.5 text-sm font-medium text-fimo-navy transition-colors hover:bg-fimo-gray/30"
          >
            <Settings className="h-4 w-4" />
            Jenis Kos
          </Link>
          <Link
            href="/admin/kos/new"
            className="flex items-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90"
          >
            <Plus className="h-4 w-4" />
            Tambah Kos
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
        {daftarKos.length === 0 ? (
          <EmptyState
            icon={Home}
            title="Belum ada kos"
            description="Mulai dengan menambahkan kos pertama."
            actionLabel="+ Tambah Kos"
            actionHref="/admin/kos/new"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                            className="text-sm font-medium text-fimo-navy hover:text-fimo-blue"
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
        )}
      </div>
    </div>
  )
}