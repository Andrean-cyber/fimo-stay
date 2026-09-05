'use client'

import { useState } from 'react'
import { createRecommendationTransaction } from './actions'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { FACILITIES } from '@/lib/constants'
import { ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const inputClass =
  'w-full rounded-xl border border-fimo-gray p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-fimo-blue focus:outline-none focus:ring-2 focus:ring-fimo-blue/30 md:p-3 md:text-base'

const checkboxItemClass =
  'flex items-center gap-2 rounded-xl border border-fimo-gray px-3 py-2.5 text-sm text-gray-700 hover:bg-fimo-gray/40 cursor-pointer'

export function RecommendationForm({ kosTypes }: { kosTypes: string[] }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedKosTypes, setSelectedKosTypes] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [specificLocation, setSpecificLocation] = useState('')
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [budgetDigits, setBudgetDigits] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [notes, setNotes] = useState('')

  const budgetDisplay = budgetDigits ? new Intl.NumberFormat('id-ID').format(Number(budgetDigits)) : ''

  function handleBudgetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    setBudgetDigits(digitsOnly)
  }

  function toggleValue(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const isFormComplete =
    name.trim() !== '' &&
    phone.trim() !== '' &&
    selectedKosTypes.length > 0 &&
    city.trim() !== '' &&
    specificLocation.trim() !== '' &&
    selectedFacilities.length > 0 &&
    budgetDigits !== '' &&
    moveInDate !== '' &&
    notes.trim() !== '' &&
    turnstileToken !== ''

  async function handleSubmit(formData: FormData) {
    if (!turnstileToken) {
      setError('Verifikasi keamanan belum selesai, tunggu sebentar.')
      return
    }
    setSubmitting(true)
    formData.set('turnstileToken', turnstileToken)
    const result = await createRecommendationTransaction(formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : 'Ada data yang belum valid, cek lagi ya.')
      setSubmitting(false)
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6 rounded-2xl border border-fimo-gray bg-white p-5 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-sm md:p-6 md:pb-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input
            name="name"
            placeholder="Masukkan nama lengkap"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nomor HP</label>
          <input
            name="phone"
            placeholder="08xxxxxxxxxx"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {kosTypes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Jenis Kos (pilih minimal satu)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {kosTypes.map((jt) => (
              <label key={jt} className={checkboxItemClass}>
                <input
                  type="checkbox"
                  name="kosTypes"
                  value={jt}
                  checked={selectedKosTypes.includes(jt)}
                  onChange={() => toggleValue(selectedKosTypes, jt, setSelectedKosTypes)}
                  className="h-4 w-4 accent-fimo-navy"
                />
                {jt}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Kota</label>
          <input
            name="city"
            placeholder="cth. Malang"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi Spesifik</label>
          <input
            name="specificLocation"
            placeholder="cth. Dekat kampus UB, Seturan"
            required
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {FACILITIES.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Fasilitas yang Diinginkan (pilih minimal satu)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FACILITIES.map((f) => (
              <label key={f} className={checkboxItemClass}>
                <input
                  type="checkbox"
                  name="facilities"
                  value={f}
                  checked={selectedFacilities.includes(f)}
                  onChange={() => toggleValue(selectedFacilities, f, setSelectedFacilities)}
                  className="h-4 w-4 accent-fimo-navy"
                />
                <span className="line-clamp-1">{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Budget per Bulan</label>
          <div className="flex items-center gap-2 rounded-xl border border-fimo-gray p-2.5 md:p-3">
            <span className="text-sm text-gray-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="1.500.000"
              required
              value={budgetDisplay}
              onChange={handleBudgetChange}
              className="w-full text-sm outline-none md:text-base"
            />
            <input type="hidden" name="budget" value={budgetDigits} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Rencana Tanggal Dihuni</label>
          <input
            name="moveInDate"
            type="date"
            required
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Catatan Tambahan</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Ada kebutuhan lain? Ceritakan di sini."
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </div>

      <TurnstileWidget onVerify={setTurnstileToken} />

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !isFormComplete}
        className="flex w-full flex-col items-center justify-center gap-0.5 rounded-xl bg-fimo-navy px-4 py-2.5 text-center text-sm font-semibold leading-snug text-white transition-colors hover:bg-fimo-navy/90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row sm:gap-2 md:py-3 md:text-base"
      >
        <span className="flex items-center gap-2">
          {submitting && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
          {submitting ? 'Memproses...' : 'Lanjutkan — Rp100.000'}
        </span>
        {!submitting && <span className="text-xs font-normal opacity-90 sm:text-sm">(3 rekomendasi kos)</span>}
      </button>
    </form>
  )
}