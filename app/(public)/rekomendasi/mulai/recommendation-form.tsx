'use client'

import { useState } from 'react'
import { createRecommendationTransaction } from './actions'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { FACILITIES } from '@/lib/constants'
import { AlertCircle, Loader2 } from 'lucide-react'

const inputClass =
  'w-full rounded-xl border border-fimo-gray p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-fimo-blue focus:outline-none focus:ring-2 focus:ring-fimo-blue/30 md:p-3 md:text-base'

const checkboxItemClass =
  'flex items-center gap-2 rounded-xl border border-fimo-gray px-3 py-2.5 text-sm text-gray-700 hover:bg-fimo-gray/40 cursor-pointer'

export function RecommendationForm({ kosTypes }: { kosTypes: string[] }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')

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
    <form action={handleSubmit} className="space-y-6 rounded-2xl border border-fimo-gray bg-white p-5 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input name="name" placeholder="Masukkan nama lengkap" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nomor HP</label>
          <input name="phone" placeholder="08xxxxxxxxxx" required className={inputClass} />
        </div>
      </div>

      {kosTypes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Jenis Kos (boleh lebih dari satu)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {kosTypes.map((jt) => (
              <label key={jt} className={checkboxItemClass}>
                <input type="checkbox" name="kosTypes" value={jt} className="h-4 w-4 accent-fimo-navy" />
                {jt}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Kota</label>
          <input name="city" placeholder="cth. Malang" required className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi Spesifik (opsional)</label>
          <input name="specificLocation" placeholder="cth. Dekat kampus UB, Seturan" className={inputClass} />
        </div>
      </div>

      {FACILITIES.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Fasilitas yang Diinginkan (opsional)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FACILITIES.map((f) => (
              <label key={f} className={checkboxItemClass}>
                <input type="checkbox" name="facilities" value={f} className="h-4 w-4 accent-fimo-navy" />
                <span className="line-clamp-1">{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Budget per Bulan (opsional)</label>
          <div className="flex items-center gap-2 rounded-xl border border-fimo-gray p-2.5 md:p-3">
            <span className="text-sm text-gray-400">Rp</span>
            <input name="budget" type="number" placeholder="1.500.000" className="w-full text-sm outline-none md:text-base" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Rencana Tanggal Dihuni (opsional)</label>
          <input name="moveInDate" type="date" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Catatan Tambahan (opsional)</label>
        <textarea name="notes" rows={3} placeholder="Ada kebutuhan lain? Ceritakan di sini." className={inputClass} />
      </div>

      <TurnstileWidget onVerify={setTurnstileToken} />

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fimo-navy/90 disabled:cursor-not-allowed disabled:opacity-50 md:py-3 md:text-base"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Memproses...' : 'Lanjutkan — Rp100.000 (3 rekomendasi kos)'}
      </button>
    </form>
  )
}