import { prisma } from '@/lib/prisma'
import { requireSuperadmin } from '@/utils/auth/require-admin'
import { updateAdminRole, removeAdmin } from './actions'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { TeamInviteForm } from './team-invite-form'
import { PendingSubmitButton } from '@/components/pending-submit-button'

export default async function TeamPage() {
  await requireSuperadmin()
  const admins = await prisma.adminProfile.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fimo-navy">Tim FimoStay</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola akses admin dan peran masing-masing anggota tim.</p>
      </div>

      {/* Daftar admin */}
      <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
        <div className="border-b border-fimo-gray px-5 py-4">
          <h2 className="font-semibold text-gray-900">Anggota Tim ({admins.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fimo-gray text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fimo-gray">
              {admins.map((a) => {
                const isSuperadmin = a.role === 'SUPERADMIN'
                const target = isSuperadmin ? 'STAFF' : 'SUPERADMIN'
                return (
                  <tr key={a.id}>
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-gray-800">{a.fullName}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">{a.email}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isSuperadmin ? 'bg-fimo-navy/10 text-fimo-navy' : 'bg-fimo-gray text-gray-600'
                        }`}
                      >
                        {isSuperadmin && <ShieldCheck className="h-3 w-3" />}
                        {a.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                    <form action={updateAdminRole.bind(null, a.id, target)}>
                      <PendingSubmitButton
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSuperadmin
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-fimo-navy/10 text-fimo-navy hover:bg-fimo-navy/20'
                        }`}
                        pendingText="Mengubah..."
                      >
                        {isSuperadmin ? 'Turunkan ke Staff' : 'Jadikan Superadmin'}
                      </PendingSubmitButton>
                    </form>
                                        </td>
                    <td>
                      <ConfirmDeleteButton
                        action={removeAdmin.bind(null, a.id)}
                        confirmMessage={`Yakin hapus akun "${a.fullName}"? Dia tidak akan bisa login lagi.`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Undang admin baru */}
      <div className="max-w-md rounded-2xl border border-fimo-gray bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-full bg-fimo-navy/5 p-2 text-fimo-navy">
            <UserPlus className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-gray-900">Undang Admin Baru</h2>
        </div>

        <TeamInviteForm />
      </div>
    </div>
  )
}
