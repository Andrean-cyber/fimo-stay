'use client'

import { useActionState } from 'react'
import { updateAdminRole } from './actions'
import { PendingSubmitButton } from '@/components/pending-submit-button'

type Props = {
  adminId: string
  target: 'STAFF' | 'SUPERADMIN'
  isSuperadmin: boolean
}

export function RoleForm({ adminId, target, isSuperadmin }: Props) {
  const [state, formAction] = useActionState(
    async (_prevState: { error?: string } | null) => {
      const res = await updateAdminRole(adminId, target)
      return res.error ? { error: res.error } : null
    },
    null
  )

  return (
    <form action={formAction}>
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
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  )
}
