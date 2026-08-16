'use client'

import { useState } from 'react'
import { PhoneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
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
    setError(null)
    formData.set('turnstileToken', turnstileToken)
    const result = await createSelfSearchTransaction(kosId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : 'Data tidak valid')
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600 md:text-base">
      Isi nomor HP kamu, tim kami akan bantu proses koneksinya ke pemilik kos setelah pembayaran dikonfirmasi.
      </p>

      <div className="relative">
        <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9+ ]*"
          placeholder="08xxxxxxxxxx"
          required
          className="w-full rounded-lg border border-fimo-gray bg-white p-2.5 pl-10 text-sm outline-none transition-colors focus:border-fimo-navy focus:ring-1 focus:ring-fimo-navy md:text-base"
        />
      </div>

      <TurnstileWidget onVerify={setTurnstileToken} />

      {error && <p className="text-sm text-red-500 md:text-base">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !turnstileToken}
        className="w-full rounded-lg bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50 disabled:hover:bg-fimo-navy md:text-base"
      >
        {submitting ? 'Memproses...' : `Proses Sekarang — Rp${(40000).toLocaleString('id-ID')}`}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 md:text-sm">
        <ShieldCheckIcon className="h-3.5 w-3.5" />
        Pembayaran diverifikasi manual oleh tim kami, prosesnya biasanya kurang dari 1x24 jam.
      </p>
    </form>
  )
}