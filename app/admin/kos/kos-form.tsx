'use client'

import { useActionState, useEffect, useState } from 'react'
import { Modal } from '@/components/modal'
import { ExclamationTriangleIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { FACILITIES, ROOM_FACILITIES } from '@/lib/constants'
import {
  Field,
  FieldLabelSpacer,
  actionButtonHeightClass,
  checkboxInputClass,
  checkboxItemClass,
  inputClass,
} from './kos-field'
import type { FormActionState } from '@/lib/action-state'

type Owner = { id: string; name: string }
type KosTypeOption = { id: string; name: string }

type RoomTypeDraft = {
  key: string
  id?: string
  name: string
  priceMonthly: string
  totalRooms: string
  availableRooms: string
  description: string
  facilities: string[]
}

type SegmentDraft = {
  key: string
  id?: string
  kosTypeId: string
  name: string
  roomTypes: RoomTypeDraft[]
}

type NearbyDraft = {
  key: string
  id?: string
  name: string
  distanceText: string
  category: string
}

type KosDefaults = {
  name?: string
  description?: string | null
  district?: string | null
  address?: string
  city?: string
  facilities?: string[]
  ownerId?: string
  segments?: {
    id: string
    kosTypeId: string
    name?: string | null
    roomTypes: {
      id: string
      name: string
      priceMonthly: number
      totalRooms?: number | null
      availableRooms?: number | null
      description?: string | null
      facilities: string[]
    }[]
  }[]
  nearby?: {
    id: string
    name: string
    distanceText: string
    category?: string | null
  }[]
}

function newKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

function emptyRoomType(): RoomTypeDraft {
  return { key: newKey(), name: '', priceMonthly: '', totalRooms: '', availableRooms: '', description: '', facilities: [] }
}

function emptySegment(defaultKosTypeId: string): SegmentDraft {
  return { key: newKey(), kosTypeId: defaultKosTypeId, name: '', roomTypes: [emptyRoomType()] }
}

function emptyNearby(): NearbyDraft {
  return { key: newKey(), name: '', distanceText: '', category: '' }
}

function nearbyFromDefaults(defaults: KosDefaults | undefined): NearbyDraft[] {
  if (!defaults?.nearby?.length) return []
  return defaults.nearby.map((n) => ({
    key: newKey(),
    id: n.id,
    name: n.name,
    distanceText: n.distanceText,
    category: n.category ?? '',
  }))
}

function segmentsFromDefaults(defaults: KosDefaults | undefined, defaultKosTypeId: string): SegmentDraft[] {
  if (!defaults?.segments?.length) return [emptySegment(defaultKosTypeId)]
  return defaults.segments.map((s) => ({
    key: newKey(),
    id: s.id,
    kosTypeId: s.kosTypeId,
    name: s.name ?? '',
    roomTypes: s.roomTypes.map((rt) => ({
      key: newKey(),
      id: rt.id,
      name: rt.name,
      priceMonthly: String(rt.priceMonthly),
      totalRooms: rt.totalRooms != null ? String(rt.totalRooms) : '',
      availableRooms: rt.availableRooms != null ? String(rt.availableRooms) : '',
      description: rt.description ?? '',
      facilities: rt.facilities ?? [],
    })),
  }))
}

export function KosForm({
  action,
  owners,
  kosTypes,
  defaults,
  submitLabel,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>
  owners: Owner[]
  kosTypes: KosTypeOption[]
  defaults?: KosDefaults
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [segments, setSegments] = useState<SegmentDraft[]>(() => segmentsFromDefaults(defaults, kosTypes[0]?.id ?? ''))
  const [nearby, setNearby] = useState<NearbyDraft[]>(() => nearbyFromDefaults(defaults))

  useEffect(() => {
    if (state?.error) setModalOpen(true)
  }, [state])

  const generalError = typeof state?.error === 'string' ? state.error : null
  const fieldErrors = typeof state?.error === 'object' ? state.error : null

  const addSegment = () => setSegments((prev) => [...prev, emptySegment(kosTypes[0]?.id ?? '')])
  const removeSegment = (key: string) => setSegments((prev) => (prev.length > 1 ? prev.filter((s) => s.key !== key) : prev))
  const updateSegment = (key: string, patch: Partial<SegmentDraft>) =>
    setSegments((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)))
  const addRoomType = (segmentKey: string) =>
    setSegments((prev) => prev.map((s) => (s.key === segmentKey ? { ...s, roomTypes: [...s.roomTypes, emptyRoomType()] } : s)))
  const removeRoomType = (segmentKey: string, roomKey: string) =>
    setSegments((prev) =>
      prev.map((s) =>
        s.key === segmentKey && s.roomTypes.length > 1 ? { ...s, roomTypes: s.roomTypes.filter((r) => r.key !== roomKey) } : s
      )
    )
  const updateRoomType = (segmentKey: string, roomKey: string, patch: Partial<RoomTypeDraft>) =>
    setSegments((prev) =>
      prev.map((s) =>
        s.key === segmentKey ? { ...s, roomTypes: s.roomTypes.map((r) => (r.key === roomKey ? { ...r, ...patch } : r)) } : s
      )
    )
  const toggleFacility = (segmentKey: string, roomKey: string, facility: string) =>
    setSegments((prev) =>
      prev.map((s) =>
        s.key === segmentKey
          ? {
              ...s,
              roomTypes: s.roomTypes.map((r) =>
                r.key === roomKey
                  ? { ...r, facilities: r.facilities.includes(facility) ? r.facilities.filter((f) => f !== facility) : [...r.facilities, facility] }
                  : r
              ),
            }
          : s
      )
    )

  const addNearby = () => setNearby((prev) => [...prev, emptyNearby()])
  const removeNearby = (key: string) => setNearby((prev) => prev.filter((n) => n.key !== key))
  const updateNearby = (key: string, patch: Partial<NearbyDraft>) =>
    setNearby((prev) => prev.map((n) => (n.key === key ? { ...n, ...patch } : n)))

  // titik kunci: sisipkan segmentsJson & nearbyJson ke FormData sebelum diteruskan ke server action
  function handleSubmit(formData: FormData) {
    const payload = segments.map((s) => ({
      id: s.id,
      kosTypeId: s.kosTypeId,
      name: s.name || undefined,
      roomTypes: s.roomTypes.map((r) => ({
        id: r.id,
        name: r.name,
        priceMonthly: r.priceMonthly,
        totalRooms: r.totalRooms || undefined,
        availableRooms: r.availableRooms || undefined,
        description: r.description || undefined,
        facilities: r.facilities,
      })),
    }))
    formData.set('segmentsJson', JSON.stringify(payload))

    const nearbyPayload = nearby.map((n) => ({
      id: n.id,
      name: n.name,
      distanceText: n.distanceText,
      category: n.category || undefined,
    }))
    formData.set('nearbyJson', JSON.stringify(nearbyPayload))

    return formAction(formData)
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-4 rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <Field label="Nama kos">
          <input name="name" defaultValue={defaults?.name} placeholder="cth. Kos Melati Residence" required className={inputClass} />
          {fieldErrors?.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>}
        </Field>

        <Field label="Deskripsi" optional>
          <textarea name="description" defaultValue={defaults?.description ?? ''} rows={3} className={`${inputClass} resize-none`} />
        </Field>

        <Field label="Kecamatan/Area" optional>
          <input name="district" defaultValue={defaults?.district ?? ''} placeholder="cth. Sukun" className={inputClass} />
        </Field>

        <Field label="Alamat">
          <input name="address" defaultValue={defaults?.address} required className={inputClass} />
        </Field>

        <Field label="Kota">
          <input name="city" defaultValue={defaults?.city} required className={inputClass} />
          {fieldErrors?.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city[0]}</p>}
        </Field>

        <Field label="Fasilitas umum kos" optional>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FACILITIES.map((f) => (
            <label key={f} className={checkboxItemClass}>
              <input type="checkbox" name="facilities" value={f} defaultChecked={defaults?.facilities?.includes(f)} className={checkboxInputClass} />
              <span className="line-clamp-2 leading-snug">{f}</span>
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

        <div className="space-y-4 border-t border-fimo-gray pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 lg:text-base">Segment & Tipe Kamar</h3>
            <button type="button" onClick={addSegment} className="flex items-center gap-1 text-sm font-medium text-fimo-navy hover:underline lg:text-[15px]">
              <PlusIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" /> Tambah Segment
            </button>
          </div>

          {segments.map((segment) => (
            <div key={segment.key} className="space-y-3 rounded-xl border border-fimo-gray p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Jenis kos">
                    <select value={segment.kosTypeId} onChange={(e) => updateSegment(segment.key, { kosTypeId: e.target.value })} required className={inputClass}>
                      <option value="" disabled>Pilih jenis</option>
                      {kosTypes.map((kt) => <option key={kt.id} value={kt.id}>{kt.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Nama segment" optional>
                    <input value={segment.name} onChange={(e) => updateSegment(segment.key, { name: e.target.value })} placeholder='cth. "Gedung Putra"' className={inputClass} />
                  </Field>
                </div>
                {segments.length > 1 && (
                  <div className="flex justify-end sm:block sm:shrink-0">
                    <FieldLabelSpacer />
                    <button
                      type="button"
                      onClick={() => removeSegment(segment.key)}
                      className={`flex ${actionButtonHeightClass} w-10 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 lg:w-11`}
                      aria-label="Hapus segment"
                    >
                      <TrashIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {segment.roomTypes.map((rt) => (
                  <div key={rt.key} className="space-y-3 rounded-lg bg-fimo-gray/20 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-4">
                      <Field label="Nama tipe kamar">
                        <input value={rt.name} onChange={(e) => updateRoomType(segment.key, rt.key, { name: e.target.value })} placeholder="cth. Standard" required className={inputClass} />
                      </Field>
                      <Field label="Harga/bulan">
                        <input type="number" value={rt.priceMonthly} onChange={(e) => updateRoomType(segment.key, rt.key, { priceMonthly: e.target.value })} required className={inputClass} />
                      </Field>
                      <Field label="Total kamar" optional>
                        <input type="number" value={rt.totalRooms} onChange={(e) => updateRoomType(segment.key, rt.key, { totalRooms: e.target.value })} className={inputClass} />
                      </Field>
                      <Field label="Kamar tersedia" optional>
                        <input type="number" value={rt.availableRooms} onChange={(e) => updateRoomType(segment.key, rt.key, { availableRooms: e.target.value })} className={inputClass} />
                      </Field>
                    </div>
                    {segment.roomTypes.length > 1 && (
                      <div className="flex justify-end sm:block sm:shrink-0">
                        <FieldLabelSpacer />
                        <button
                          type="button"
                          onClick={() => removeRoomType(segment.key, rt.key)}
                          className={`flex ${actionButtonHeightClass} w-10 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 lg:w-11`}
                          aria-label="Hapus tipe kamar"
                        >
                          <TrashIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                        </button>
                      </div>
                    )}
                  </div>
                
                  <Field label="Deskripsi kamar" optional>
                    <textarea
                      value={rt.description}
                      onChange={(e) => updateRoomType(segment.key, rt.key, { description: e.target.value })}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                
                  <Field label="Fasilitas kamar" optional>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {ROOM_FACILITIES.map((f) => (
                        <label key={f} className={checkboxItemClass}>
                          <input
                            type="checkbox"
                            checked={rt.facilities.includes(f)}
                            onChange={() => toggleFacility(segment.key, rt.key, f)}
                            className={checkboxInputClass}
                          />
                          <span className="line-clamp-2 leading-snug">{f}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
                ))}
                <button type="button" onClick={() => addRoomType(segment.key)} className="flex items-center gap-1 text-xs font-medium text-fimo-navy hover:underline sm:text-xs lg:text-sm">
                  <PlusIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> Tambah Tipe Kamar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-fimo-gray pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 lg:text-base">Lokasi Terdekat (Nearby)</h3>
            <button type="button" onClick={addNearby} className="flex items-center gap-1 text-sm font-medium text-fimo-navy hover:underline lg:text-[15px]">
              <PlusIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" /> Tambah Nearby
            </button>
          </div>

          {nearby.length === 0 && (
            <p className="text-sm text-gray-400 lg:text-[15px]">Belum ada lokasi terdekat ditambahkan.</p>
          )}

          {nearby.map((n) => (
            <div key={n.key} className="flex flex-col gap-3 rounded-xl border border-fimo-gray p-3 sm:flex-row sm:items-start">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Nama tempat">
                  <input
                    value={n.name}
                    onChange={(e) => updateNearby(n.key, { name: e.target.value })}
                    placeholder='cth. "Universitas Brawijaya"'
                    className={inputClass}
                  />
                </Field>
                <Field label="Jarak">
                  <input
                    value={n.distanceText}
                    onChange={(e) => updateNearby(n.key, { distanceText: e.target.value })}
                    placeholder='cth. "2 menit" / "1.2 km"'
                    className={inputClass}
                  />
                </Field>
                <Field label="Kategori" optional>
                  <input
                    value={n.category}
                    onChange={(e) => updateNearby(n.key, { category: e.target.value })}
                    placeholder='cth. "kampus"'
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="flex justify-end sm:block sm:shrink-0">
                <FieldLabelSpacer />
                <button
                  type="button"
                  onClick={() => removeNearby(n.key)}
                  className={`flex ${actionButtonHeightClass} w-10 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 lg:w-11`}
                  aria-label="Hapus nearby"
                >
                  <TrashIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isPending} className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-fimo-navy/90 disabled:opacity-50 sm:w-auto lg:px-5 lg:py-3 lg:text-[15px]">
          {isPending ? 'Menyimpan...' : submitLabel}
        </button>
      </form>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tidak Bisa Disimpan">
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{generalError}</p>
        </div>
        <button onClick={() => setModalOpen(false)} className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-fimo-navy/90">
          Mengerti
        </button>
      </Modal>
    </>
  )
}
