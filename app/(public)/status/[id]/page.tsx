import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import {
  PAYMENT_INFO,
  getReferenceCode,
  buildWhatsAppLink,
} from '@/lib/constants'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu verifikasi tim',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
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

  const label =
    trx.type === 'SELF_SEARCH'
      ? 'Buka Kontak Kos'
      : 'Rekomendasi 3 Kos'

  const waLink = buildWhatsAppLink(trx.id, label, trx.amount)

  return (
    <div>
      <PublicHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">
          Status Transaksi
        </h1>

        <p className="text-gray-600 mb-6">
          {label} — Rp{trx.amount.toLocaleString('id-ID')}
        </p>

        <div className="border rounded p-4 mb-4">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold">
            {STATUS_LABEL[trx.status]}
          </p>
        </div>

        {trx.status === 'PENDING' && (
          <div className="space-y-4">
            <div className="border rounded p-4 bg-gray-50">
              <p className="text-sm mb-2">
                1. Transfer{' '}
                <b>
                  Rp{trx.amount.toLocaleString('id-ID')}
                </b>{' '}
                ke{' '}
                <b>
                  {PAYMENT_INFO.bank}{' '}
                  {PAYMENT_INFO.accountNumber} a.n.{' '}
                  {PAYMENT_INFO.accountName}
                </b>
              </p>

              <p className="text-sm mb-2">
                2. Kirim screenshot bukti transfer ke WhatsApp
                kami, sertakan kode referensi:
              </p>

              <p className="text-lg font-mono font-bold text-center bg-white border rounded py-2">
                {getReferenceCode(trx.id)}
              </p>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-green-600 text-white px-4 py-3 rounded"
            >
              Kirim via WhatsApp
            </a>

            <p className="text-xs text-gray-400 text-center">
              Simpan link halaman ini untuk cek status setelah tim
              verifikasi (biasanya kurang dari 1x24 jam).
            </p>
          </div>
        )}

        {trx.status === 'VERIFIED' &&
          trx.type === 'SELF_SEARCH' &&
          trx.targetKos && (
            <div className="border rounded p-4 bg-green-50">
              <p className="font-semibold">
                {trx.targetKos.name}
              </p>

              <p className="text-sm">
                Owner: {trx.targetKos.owner.name}
              </p>

              <p className="text-sm">
                Kontak: {trx.targetKos.owner.phone}
              </p>
            </div>
          )}

        {trx.status === 'VERIFIED' &&
          trx.type === 'RECOMMENDATION' &&
          trx.recommendationToken && (
            <a
              href={`/rekomendasi/${trx.recommendationToken}`}
              className="block text-center bg-black text-white px-4 py-3 rounded"
            >
              Lihat 3 Rekomendasi Kos
            </a>
          )}

        {trx.status === 'REJECTED' && (
          <p className="text-sm text-red-500">
            Pembayaran tidak dapat kami verifikasi. Silakan
            hubungi WhatsApp kami untuk klarifikasi.
          </p>
        )}
      </main>
    </div>
  )
}