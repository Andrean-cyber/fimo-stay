import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30'

// Ukuran seragam untuk semua checkbox fasilitas
export const checkboxItemClass =
  'flex h-11 w-full items-center gap-2 rounded-xl border border-fimo-gray px-3 text-sm text-gray-700 hover:bg-fimo-gray/40 transition-colors'

export const checkboxInputClass = 'h-4 w-4 shrink-0 accent-fimo-navy'

// Tinggi tombol yang sama persis dengan tinggi <input> (py-2.5 + border + text-sm)
export const actionButtonHeightClass = 'h-[42px]'

// Reserves ruang vertikal yang sama persis dengan label Field, supaya
// tombol (mis. tombol hapus) yang ditaruh di sebelah sekumpulan Field
// sejajar dengan INPUT-nya, bukan dengan label-nya.
export function FieldLabelSpacer() {
  return <div className="mb-1.5 h-5" aria-hidden="true" />
}

export function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      {/* h-5 fixed + truncate: label TIDAK PERNAH wrap 2 baris, jadi semua
          Field di satu baris selalu punya offset yang sama ke input-nya */}
      <div className="mb-1.5 flex h-5 items-center gap-1">
        <span className="truncate text-sm font-medium text-gray-700">{label}</span>
        {optional && <span className="shrink-0 text-xs text-gray-400">(opsional)</span>}
      </div>
      {children}
    </div>
  )
}