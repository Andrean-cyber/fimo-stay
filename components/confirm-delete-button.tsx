'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from './modal'

export function ConfirmDeleteButton({
  action,
  itemName,
  extraWarning,
  label = 'Hapus',
}: {
  action: () => Promise<{ error?: string } | void>
  itemName: string
  extraWarning?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>

      <Modal open={open} onClose={() => !isPending && setOpen(false)} title="Hapus Data">
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <p className="min-w-0 text-sm text-amber-800">
            Yakin ingin menghapus <b>{itemName}</b>? Tindakan ini tidak bisa dibatalkan.
            {extraWarning && <span className="block mt-1">{extraWarning}</span>}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="rounded-xl border border-fimo-gray px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </Modal>
    </>
  )
}