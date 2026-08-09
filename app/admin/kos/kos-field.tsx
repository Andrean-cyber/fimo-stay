// kos-field.tsx (baru, dipakai di new & edit)
export const inputClass =
  'w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30'

export function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {optional && <span className="text-gray-400">(opsional)</span>}
      </label>
      {children}
    </div>
  )
}