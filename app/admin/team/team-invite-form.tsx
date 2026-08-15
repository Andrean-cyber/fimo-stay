'use client'

import { useActionState, useEffect, useState } from 'react'
import { Modal } from '@/components/modal'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { inviteAdmin } from './actions'

export function TeamInviteForm() {
  const [state, formAction, isPending] = useActionState(inviteAdmin, undefined)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (state?.error) setModalOpen(true)
  }, [state])

  return (
    <>
      <form action={formAction} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 lg:text-[15px]" htmlFor="fullName">
            Nama lengkap
          </label>
          <input
            id="fullName"
            name="fullName"
            placeholder="cth. Budi Santoso"
            required
            className="w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30 lg:py-3 lg:text-[15px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 lg:text-[15px]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30 lg:py-3 lg:text-[15px]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50 lg:py-3 lg:text-[15px]"
        >
          {isPending ? 'Mengirim...' : 'Kirim Undangan'}
        </button>
        {state?.success && (
          <p className="flex items-center gap-1 text-sm text-green-600 lg:text-[15px]">
            <CheckCircle2 className="h-4 w-4 lg:h-[18px] lg:w-[18px]" /> Undangan berhasil dikirim.
          </p>
        )}
      </form>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Gagal Mengirim Undangan">
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="min-w-0 text-sm text-red-700">{state?.error}</p>
        </div>
        <button onClick={() => setModalOpen(false)} className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-fimo-navy/90">
          Mengerti
        </button>
      </Modal>
    </>
  )
}
