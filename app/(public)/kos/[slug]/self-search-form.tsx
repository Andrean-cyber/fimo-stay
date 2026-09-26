'use client'

import { useState } from 'react'
import { PhoneIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { createSelfSearchTransaction } from './actions'
import { TurnstileWidget } from '@/components/turnstile-widget'

// Ganti sesuai nomor WA tim kamu (format internasional, tanpa + atau spasi)
const WHATSAPP_NUMBER = '6289666783030'

export function SelfSearchForm({
  kosId,
  kosName,
}: {
  kosId: string
  kosName?: string // opsional — kalau diisi, pesan WA otomatis menyebut nama kosnya
}) {
  const [step, setStep] = useState<'menu' | 'form'>('menu')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [agreed, setAgreed] = useState(false)

  const waMessage = kosName
    ? `Halo, saya mau tanya-tanya tentang kos ${kosName}`
    : 'Halo, saya mau tanya-tanya tentang kos ini'
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  async function handleSubmit(formData: FormData) {
    if (!turnstileToken) {
      setError('Verifikasi keamanan belum selesai, tunggu sebentar.')
      return
    }
    if (!agreed) {
      setError('Kamu perlu menyetujui ketentuan terlebih dahulu.')
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

  // ===== Step 1: menu dua tombol =====
  if (step === 'menu') {
    return (
      <div className="space-y-2.5 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-fimo-navy px-4 py-2.5 text-sm font-medium text-fimo-navy transition-colors hover:bg-fimo-navy/5 md:text-base"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0" />
          Tanya Kami
        </a>
        <button
          type="button"
          onClick={() => setStep('form')}
          className="w-full rounded-lg bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 md:text-base"
        >
          Detail Kos
        </button>
      </div>
    )
  }

  // ===== Step 2: form nomor HP + turnstile + ketentuan =====
  return (
    <form
      action={handleSubmit}
      className="space-y-3 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-3"
    >
      <button
        type="button"
        onClick={() => setStep('menu')}
        className="text-xs font-medium text-gray-400 transition-colors hover:text-fimo-navy md:text-sm"
      >
        ← Kembali
      </button>

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

      <div className="rounded-lg bg-fimo-gray/30 p-3 text-xs leading-relaxed text-gray-600 md:text-sm">
        <p className="font-medium text-gray-800">Ketentuan:</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          <li>Biaya Rp40.000 digunakan untuk membuka kontak owner kos ini.</li>
          <li>Pembayaran diverifikasi manual oleh tim kami, prosesnya biasanya kurang dari 1x24 jam.</li>
          <li>Jika kamar pada kos ini ternyata sudah penuh, dana akan direfund 100%.</li>
        </ul>
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-600 md:text-sm">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-fimo-gray text-fimo-navy focus:ring-fimo-navy"
        />
        Saya sudah membaca dan menyetujui ketentuan di atas
      </label>

      {error && <p className="text-sm text-red-500 md:text-base">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !turnstileToken || !agreed}
        className="w-full rounded-lg bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50 disabled:hover:bg-fimo-navy md:text-base"
      >
        {submitting ? 'Memproses...' : `Proses Sekarang — Rp${(40000).toLocaleString('id-ID')}`}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400 md:text-sm">
        <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0" />
        Pembayaran diverifikasi manual oleh tim kami, prosesnya biasanya kurang dari 1x24 jam.
      </p>
    </form>
  )
}
