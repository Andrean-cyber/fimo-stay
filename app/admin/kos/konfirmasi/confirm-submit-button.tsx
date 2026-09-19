'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

/**
 * Tombol submit untuk form konfirmasi kos.
 * Harus dipakai SEBAGAI ANAK LANGSUNG dari <form>, karena useFormStatus()
 * hanya bisa membaca status pending dari <form> ancestor terdekat.
 *
 * Pakai variant="outline" untuk tombol "Konfirmasi" per-item,
 * dan variant="solid" untuk tombol "Konfirmasi Semua".
 */
export function ConfirmSubmitButton({
  label = 'Konfirmasi',
  pendingLabel = 'Mengonfirmasi...',
  variant = 'outline',
}: {
  label?: string
  pendingLabel?: string
  variant?: 'outline' | 'solid'
}) {
  const { pending } = useFormStatus()

  const base =
    'inline-flex shrink-0 items-center gap-1.5 rounded-xl text-xs font-medium transition-colors disabled:cursor-not-allowed'
  const outline = 'border border-fimo-gray px-3 py-1.5 text-fimo-navy hover:bg-fimo-gray/30'
  const solid = 'bg-fimo-navy px-3.5 py-2 text-white hover:bg-fimo-navy/90'
  const pendingStyle = 'border-fimo-navy bg-fimo-navy px-3.5 py-2 text-white'

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${base} ${pending ? pendingStyle : variant === 'solid' ? solid : outline}`}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? pendingLabel : label}
    </button>
  )
}
