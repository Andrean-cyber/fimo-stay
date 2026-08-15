import { prisma } from '@/lib/prisma'
import { requireSuperadmin } from '@/utils/auth/require-admin'
import { removeAdminAction } from './actions'
import { ShieldCheck, UserPlus, Mail } from 'lucide-react'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { TeamInviteForm } from './team-invite-form'
import { RoleForm } from './role-form'

export default async function TeamPage() {
  await requireSuperadmin()
  const admins = await prisma.adminProfile.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Tim FimoStay</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Kelola akses admin dan peran masing-masing anggota tim.
        </p>
      </div>

      {/* Daftar admin */}
      <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
        <div className="border-b border-fimo-gray px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Anggota Tim ({admins.length})
          </h2>
        </div>

        {/* ===== Mobile: card list (tampil < md) ===== */}
        <div className="space-y-3 p-4 md:hidden">
          {admins.map((a) => {
            const isSuperadmin = a.role === 'SUPERADMIN'
            const target = isSuperadmin ? 'STAFF' : 'SUPERADMIN'
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-800">{a.fullName}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{a.email}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isSuperadmin ? 'bg-fimo-navy/10 text-fimo-navy' : 'bg-fimo-gray text-gray-600'
                    }`}
                  >
                    {isSuperadmin && <ShieldCheck className="h-3 w-3" />}
                    {a.role}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-fimo-gray pt-3">
                  <RoleForm adminId={a.id} target={target} isSuperadmin={isSuperadmin} />
                  <ConfirmDeleteButton
                    action={removeAdminAction.bind(null, a.id)}
                    itemName={a.fullName}
                    extraWarning="Dia tidak akan bisa login lagi."
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* ===== Desktop: table (tampil >= md) ===== */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm lg:text-[15px]">
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
                  <tr key={a.id} className="transition-colors hover:bg-fimo-gray/30">
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
                      <div className="flex items-center gap-3">
                        <RoleForm adminId={a.id} target={target} isSuperadmin={isSuperadmin} />
                        <ConfirmDeleteButton
                          action={removeAdminAction.bind(null, a.id)}
                          itemName={a.fullName}
                          extraWarning="Dia tidak akan bisa login lagi."
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Undang admin baru */}
      <div className="max-w-md rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-full bg-fimo-navy/5 p-2 text-fimo-navy">
            <UserPlus className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Undang Admin Baru</h2>
        </div>

        <TeamInviteForm />
      </div>
    </div>
  )
}