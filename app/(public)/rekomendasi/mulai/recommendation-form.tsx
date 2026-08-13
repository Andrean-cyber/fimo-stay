'use client'

import { useState } from 'react'
import { createRecommendationTransaction } from './actions'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { AlertCircle, Loader2 } from 'lucide-react'

export function RecommendationForm() {
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
      setError(typeof result.error === 'string' ? result.error : 'Data tidak valid')
      setSubmitting(false)
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-fimo-gray bg-white p-5 shadow-sm"
    >
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Nomor HP
        </label>
        <input
          id="phone"
          name="phone"
          placeholder="08xxxxxxxxxx"
          required
          className="w-full rounded-xl border border-fimo-gray p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-fimo-blue focus:outline-none focus:ring-2 focus:ring-fimo-blue/30"
        />
      </div>

      <div>
        <label htmlFor="preferenceNotes" className="mb-1 block text-sm font-medium text-gray-700">
          Preferensi kamu
        </label>
        <textarea
          id="preferenceNotes"
          name="preferenceNotes"
          placeholder="Ceritakan preferensimu: lokasi, budget, tipe kamar, dll"
          required
          rows={4}
          className="w-full rounded-xl border border-fimo-gray p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-fimo-blue focus:outline-none focus:ring-2 focus:ring-fimo-blue/30"
        />
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fimo-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Memproses...' : 'Lanjutkan — Rp90.000'}
      </button>
    </form>
  )
}