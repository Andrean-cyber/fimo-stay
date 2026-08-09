'use client'

import { useActionState, useEffect, useState } from 'react'
import { Modal } from '@/components/modal'
import { AlertTriangle } from 'lucide-react'
import { FACILITIES } from '@/lib/constants'
import type { FormActionState } from '@/lib/action-state'

const inputClass =
  'w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30'

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {optional && <span className="text-gray-400">(opsional)</span>}
      </label>
      {children}
    </div>
  )
}

type Owner = { id: string; name: string }
type KosDefaults = {
  name?: string
  description?: string | null
  address?: string
  city?: string
  priceMonthly?: number
  roomType?: string | null
  facilities?: string[]
  ownerId?: string
}

export function KosForm({
  action,
  owners,
  defaults,
  submitLabel,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>
  owners: Owner[]
  defaults?: KosDefaults
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (state?.error) setModalOpen(true)
  }, [state])

  const generalError = typeof state?.error === 'string' ? state.error : null
  const fieldErrors = typeof state?.error === 'object' ? state.error : null

  return (
    <>
      <form action={formAction} className="space-y-4 rounded-2xl border border-fimo-gray bg-white p-6 shadow-sm">
        <Field label="Nama kos">
          <input name="name" defaultValue={defaults?.name} placeholder="cth. Kos Melati Residence" required className={inputClass} />
          {fieldErrors?.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>}
        </Field>

        <Field label="Deskripsi" optional>
          <textarea name="description" defaultValue={defaults?.description ?? ''} rows={3} className={`${inputClass} resize-none`} />
        </Field>

        <Field label="Alamat">
          <input name="address" defaultValue={defaults?.address} required className={inputClass} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Kota">
            <input name="city" defaultValue={defaults?.city} required className={inputClass} />
            {fieldErrors?.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city[0]}</p>}
          </Field>
          <Field label="Harga per bulan">
            <input name="priceMonthly" type="number" defaultValue={defaults?.priceMonthly} required className={inputClass} />
          </Field>
        </div>

        <Field label="Tipe kamar">
          <select name="roomType" defaultValue={defaults?.roomType ?? 'putra'} className={inputClass}>
            <option value="putra">Putra</option>
            <option value="putri">Putri</option>
            <option value="campur">Campur</option>
          </select>
        </Field>

        <Field label="Fasilitas">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FACILITIES.map((f) => (
              <label key={f} className="flex items-center gap-2 rounded-xl border border-fimo-gray px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-fimo-gray/40">
                <input type="checkbox" name="facilities" value={f} defaultChecked={defaults?.facilities?.includes(f)} className="h-4 w-4 accent-fimo-navy" />
                {f}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Owner">
          <select name="ownerId" defaultValue={defaults?.ownerId ?? ''} required className={inputClass}>
            <option value="" disabled>Pilih owner</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </Field>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? 'Menyimpan...' : submitLabel}
        </button>
      </form>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tidak Bisa Disimpan">
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{generalError}</p>
        </div>
        <button
          onClick={() => setModalOpen(false)}
          className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-fimo-navy/90"
        >
          Mengerti
        </button>
      </Modal>
    </>
  )
}