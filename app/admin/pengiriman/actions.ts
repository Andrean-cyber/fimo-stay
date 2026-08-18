'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { revalidatePath } from 'next/cache'

export async function markTransactionSent(transactionId: string) {
  const admin = await requireAdmin()

  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, status: 'VERIFIED', sentAt: null },
    data: { sentAt: new Date(), sentById: admin.id },
  })

  if (result.count === 0) {
    return { error: 'Transaksi ini sudah ditandai terkirim sebelumnya.' }
  }

  await prisma.auditLog.create({
    data: { entityType: 'transaction', entityId: transactionId, action: 'send_whatsapp', adminId: admin.id, transactionId },
  })

  revalidatePath('/admin/pengiriman')
}