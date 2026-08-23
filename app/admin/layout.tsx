import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from './admin-sidebar'
import { countKosNeedConfirmation } from '@/lib/kos-confirmation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fimo-gray/50">
        {children}
      </div>
    )
  }

  const [profile, kosNeedConfirmationCount] = await Promise.all([
    prisma.adminProfile.findUnique({ where: { id: user.id } }),
    countKosNeedConfirmation(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-fimo-gray/40 md:flex-row">
      <AdminSidebar
        role={profile?.role ?? null}
        displayName={profile?.fullName ?? user.email ?? ''}
        badgeCounts={{ kosNeedConfirmation: kosNeedConfirmationCount }}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
      </main>
    </div>
  )
}