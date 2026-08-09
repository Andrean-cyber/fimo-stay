'use client'

import { useState } from 'react'
import { createSelfSearchTransaction } from './actions'
import { TurnstileWidget } from '@/components/turnstile-widget'

export function SelfSearchForm({ kosId }: { kosId: string }) {
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
    const result = await createSelfSearchTransaction(kosId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : 'Data tidak valid')
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3 mt-4 border p-4 rounded max-w-sm">
      <p className="text-sm text-gray-600">
        Isi nomor HP kamu dulu — instruksi transfer & konfirmasi WhatsApp muncul di langkah berikutnya.
      </p>
      <input name="phone" placeholder="Nomor HP kamu" required className="border p-2 w-full rounded" />
      <TurnstileWidget onVerify={setTurnstileToken} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={submitting} className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-50">
        {submitting ? 'Memproses...' : `Lanjutkan — Rp${(30000).toLocaleString('id-ID')}`}
      </button>
    </form>
  )
}