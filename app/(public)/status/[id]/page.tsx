import { notFound } from 'next/navigation'
import { MapPin, Phone, ShieldCheck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import {
  PAYMENT_INFO,
  getReferenceCode,
  buildWhatsAppLink,
  buildOwnerWhatsAppLink,
} from '@/lib/constants'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu verifikasi tim',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  VERIFIED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const trx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      targetKos: {
        include: {
          owner: true,
        },
      },
    },
  })

  if (!trx) notFound()

  const label = trx.type === 'SELF_SEARCH' ? 'Buka Kontak Kos' : 'Rekomendasi 3 Kos'
  const waLink = buildWhatsAppLink(trx.id, label, trx.amount)

  return (
    <div>
      <PublicHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-fimo-navy md:text-3xl">
          Status Transaksi
        </h1>

        <p className="mb-6 mt-1 text-sm text-gray-500 md:text-base">
          {label} — Rp{trx.amount.toLocaleString('id-ID')}
        </p>

        <div className="mb-4 rounded-xl border border-fimo-gray p-4 md:p-5">
          <p className="text-xs text-gray-500 md:text-sm">Status</p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold md:text-base ${STATUS_STYLE[trx.status] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {STATUS_LABEL[trx.status]}
          </span>
        </div>

        {trx.status === 'PENDING' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-fimo-gray bg-gray-50 p-4 md:p-5">
              <p className="mb-2 text-sm text-gray-700 md:text-base">
                1. Transfer{' '}
                <b className="text-gray-900">
                  Rp{trx.amount.toLocaleString('id-ID')}
                </b>{' '}
                ke{' '}
                <b className="text-gray-900">
                  {PAYMENT_INFO.bank}{' '}
                  {PAYMENT_INFO.accountNumber} a.n.{' '}
                  {PAYMENT_INFO.accountName}
                </b>
              </p>

              <p className="mb-2 text-sm text-gray-700 md:text-base">
                2. Kirim screenshot bukti transfer ke WhatsApp
                kami, sertakan kode referensi:
              </p>

              <p className="rounded-lg border bg-white py-2 text-center font-mono text-lg font-bold text-fimo-navy md:text-xl">
                {getReferenceCode(trx.id)}
              </p>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 md:text-base"
            >
              Kirim via WhatsApp
            </a>

            <p className="text-center text-xs text-gray-400 md:text-sm">
              Simpan link halaman ini untuk cek status setelah tim
              verifikasi (biasanya kurang dari 1x24 jam).
            </p>
          </div>
        )}

        {trx.status === 'VERIFIED' &&
          trx.type === 'SELF_SEARCH' &&
          trx.targetKos && (
            <div className="rounded-xl border border-fimo-gray bg-green-50 p-4 md:p-5">
              <p className="text-base font-semibold text-gray-900 md:text-lg">
                {trx.targetKos.name}
              </p>

              <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-700 md:text-base">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fimo-navy" />
                {trx.targetKos.address}
              </p>

              <div className="my-4 h-px bg-fimo-gray/60" />

              <p className="text-sm text-gray-700 md:text-base">
                Owner: <b>{trx.targetKos.owner.name}</b>
              </p>
              <p className="text-sm text-gray-700 md:text-base">
                Kontak: {trx.targetKos.owner.phone}
              </p>

              <a
                href={buildOwnerWhatsAppLink(trx.targetKos.owner.phone, trx.targetKos.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 md:text-base"
              >
                <Phone className="h-4 w-4" />
                Hubungi Owner via WhatsApp
              </a>
            </div>
          )}

        {trx.status === 'VERIFIED' &&
          trx.type === 'RECOMMENDATION' &&
          trx.recommendationToken && (
            <a
              href={`/rekomendasi/${trx.recommendationToken}`}
              className="block rounded-xl bg-fimo-navy px-4 py-3 text-center text-sm font-semibold text-white hover:bg-fimo-navy/90 md:text-base"
            >
              Lihat 3 Rekomendasi Kos
            </a>
          )}

        {trx.status === 'REJECTED' && (
          <p className="text-sm text-red-500 md:text-base">
            Pembayaran tidak dapat kami verifikasi. Silakan
            hubungi WhatsApp kami untuk klarifikasi.
          </p>
        )}
      </main>
    </div>
  )
}
