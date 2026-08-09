import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteOwner } from './actions'
import { EmptyState } from '@/components/empty-state'

export default async function OwnersPage() {
  await requireAdmin()
  const owners = await prisma.owner.findMany({ orderBy: { name: 'asc' }, include: { kos: true } })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fimo-navy">Daftar Owner</h1>
          <p className="mt-1 text-sm text-gray-500">{owners.length} owner terdaftar</p>
        </div>
        <Link
          href="/admin/owners/new"
          className="flex items-center gap-1.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Owner
        </Link>
      </div>

      <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
        {owners.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada owner"
            description="Tambahkan owner sebelum bisa menambahkan kos."
            actionLabel="+ Tambah Owner"
            actionHref="/admin/owners/new"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                        {o.kos.length} kos
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/owners/${o.id}/edit`}
                          className="text-sm font-medium text-fimo-navy hover:text-fimo-blue"
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
        )}
      </div>
    </div>
  )
}