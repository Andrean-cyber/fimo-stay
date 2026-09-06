// app/admin/kos/pengaturan/kota/merge-city-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { mergeCities } from './actions'

export function MergeCityForm({ cities }: { cities: { name: string; count: number }[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [isPending, startTransition] = useTransition()

  const toggle = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  const handleMerge = () => {
    if (!target || selected.length < 2) return
    startTransition(async () => {
      await mergeCities(selected, target)
      setSelected([])
      setTarget('')
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {cities.map((c) => (
          <label
            key={c.name}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${
              selected.includes(c.name) ? 'border-fimo-blue bg-fimo-blue/10' : 'border-fimo-gray'
            }`}
          >
            <span>
              {c.name} <span className="text-xs text-gray-400">({c.count})</span>
            </span>
            <input
              type="checkbox"
              checked={selected.includes(c.name)}
              onChange={() => toggle(c.name)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>

      {selected.length >= 2 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-fimo-gray bg-white p-4">
          <span className="text-sm text-gray-600">Gabung {selected.join(', ')} menjadi:</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-lg border border-fimo-gray px-3 py-1.5 text-sm"
          >
            <option value="">Pilih nama final</option>
            {selected.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={handleMerge}
            disabled={!target || isPending}
            className="rounded-lg bg-fimo-navy px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Menggabungkan...' : 'Gabungkan'}
          </button>
        </div>
      )}
    </div>
  )
}