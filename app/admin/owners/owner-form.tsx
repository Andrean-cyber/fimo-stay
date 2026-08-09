'use client'

import { useActionState, useEffect, useState } from 'react'
import { Modal } from '@/components/modal'
import { AlertTriangle } from 'lucide-react'
import type { FormActionState } from '@/lib/action-state'

const inputClass =
  'w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30'

export function OwnerForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>
  defaults?: { name?: string; phone?: string; address?: string | null; notes?: string | null }
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (state?.error) setModalOpen(true)
  }, [state])

  const generalError = typeof state?.error === 'string' ? state.error : null

  return (
    <>
      <form action={formAction} className="max-w-lg space-y-3 rounded-2xl border border-fimo-gray bg-white p-6 shadow-sm">
        <input name="name" defaultValue={defaults?.name} placeholder="Nama owner" required className={inputClass} />
        <input name="phone" defaultValue={defaults?.phone} placeholder="Nomor telepon" required className={inputClass} />
        <input name="address" defaultValue={defaults?.address ?? ''} placeholder="Alamat (opsional)" className={inputClass} />
        <textarea name="notes" defaultValue={defaults?.notes ?? ''} placeholder="Catatan internal (opsional)" className={inputClass} />
        <button type="submit" disabled={isPending} className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-fimo-navy/90 disabled:opacity-50 sm:w-auto">
          {isPending ? 'Menyimpan...' : submitLabel}
        </button>
      </form>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tidak Bisa Disimpan">
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{generalError}</p>
        </div>
        <button onClick={() => setModalOpen(false)} className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-fimo-navy/90">
          Mengerti
        </button>
      </Modal>
    </>
  )
}