'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { PAYMENT_INFO, getReferenceCode, buildWhatsAppLink } from '@/lib/constants'

type TrxStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
type Trx = { id: string; type: 'SELF_SEARCH' | 'RECOMMENDATION'; amount: number; status: TrxStatus }

const STATUS_LABEL: Record<TrxStatus, string> = {
  PENDING: 'Menunggu verifikasi tim',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}

const STATUS_STYLE: Record<TrxStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  VERIFIED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export function StatusView({ initialTrx }: { initialTrx: Trx }) {
  const [trx, setTrx] = useState(initialTrx)

  // Subscribe hanya selagi masih PENDING — begitu admin verifikasi/tolak,
  // state di sini ikut berubah tanpa user perlu refresh halaman.
  useEffect(() => {
    if (trx.status !== 'PENDING') return

    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel(`transaction-${trx.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `id=eq.${trx.id}` },
        (payload) => {
          const updated = payload.new as { status: TrxStatus }
          setTrx((prev) => ({ ...prev, status: updated.status }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trx.id, trx.status])

  const label = trx.type === 'SELF_SEARCH' ? 'Buka Kontak Kos' : 'Rekomendasi 3 Kos'
  const waLink = buildWhatsAppLink(trx.id, label, trx.amount)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-fimo-navy md:text-3xl">Status Transaksi</h1>

      <p className="mb-6 mt-1 text-sm text-gray-500 md:text-base">
        {label} — Rp{trx.amount.toLocaleString('id-ID')}
      </p>

      <div className="mb-4 rounded-xl border border-fimo-gray p-4 md:p-5">
        <p className="text-xs text-gray-500 md:text-sm">Status</p>
        <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold md:text-base ${STATUS_STYLE[trx.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {STATUS_LABEL[trx.status]}
        </span>
      </div>

      {trx.status === 'PENDING' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-fimo-gray bg-gray-50 p-4 md:p-5">
            <p className="mb-2 text-sm text-gray-700 md:text-base">
              1. Transfer <b className="text-gray-900">Rp{trx.amount.toLocaleString('id-ID')}</b> ke{' '}
              <b className="text-gray-900">{PAYMENT_INFO.bank} {PAYMENT_INFO.accountNumber} a.n. {PAYMENT_INFO.accountName}</b>
            </p>
            <p className="mb-2 text-sm text-gray-700 md:text-base">
              2. Kirim screenshot bukti transfer ke WhatsApp kami, sertakan kode referensi:
            </p>
            <p className="rounded-lg border bg-white py-2 text-center font-mono text-lg font-bold text-fimo-navy md:text-xl">
              {getReferenceCode(trx.id)}
            </p>
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 md:text-base">
            Kirim via WhatsApp
          </a>

          <p className="text-center text-xs text-gray-400 md:text-sm">
            Halaman ini otomatis update begitu tim kami memverifikasi, tidak perlu di-refresh.
          </p>
        </div>
      )}

      {trx.status === 'VERIFIED' && (
        <div className="rounded-xl border border-fimo-gray bg-green-50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900 md:text-base">Pembayaran terverifikasi</p>
              <p className="mt-1 text-sm text-gray-700 md:text-base">
                {trx.type === 'SELF_SEARCH'
                  ? 'Detail kos dan kontak owner sudah kami kirimkan ke WhatsApp kamu.'
                  : 'Rekomendasi 3 kos akan kami kirimkan ke WhatsApp kamu dalam 1-4 Hari Kerja.'}
              </p>
            </div>
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 md:text-base">
            <MessageCircle className="h-4 w-4" />
            Buka Chat WhatsApp
          </a>

          <p className="mt-3 text-center text-xs text-gray-400 md:text-sm">
            Tidak menerima pesan? Hubungi kami via tombol di atas dengan menyertakan kode referensi{' '}
            <span className="font-mono font-semibold text-gray-600">{getReferenceCode(trx.id)}</span>.
          </p>
        </div>
      )}

      {trx.status === 'REJECTED' && (
        <p className="text-sm text-red-500 md:text-base">
          Pembayaran tidak dapat kami verifikasi. Silakan hubungi WhatsApp kami untuk klarifikasi.
        </p>
      )}
    </main>
  )
}
