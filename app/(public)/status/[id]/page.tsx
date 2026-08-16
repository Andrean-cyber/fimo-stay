import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { StatusView } from './status-view'

export const dynamic = 'force-dynamic'

export default async function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Sengaja TIDAK include targetKos/owner atau recommendationItems di sini.
  // Detail sensitif (alamat, kontak owner, daftar rekomendasi) tidak lagi
  // ditampilkan di web — dikirim manual oleh admin via WhatsApp setelah
  // transaksi diverifikasi. Halaman ini murni status tracker.
  const trx = await prisma.transaction.findUnique({
    where: { id },
    select: { id: true, type: true, amount: true, status: true },
  })

  if (!trx) notFound()

  return (
    <div>
      <PublicHeader />
      <StatusView initialTrx={trx} />
    </div>
  )
}
