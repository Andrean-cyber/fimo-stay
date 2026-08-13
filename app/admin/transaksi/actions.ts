'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { RECOMMENDATION_KOS_COUNT } from '@/lib/constants'
import type { FormActionState } from '@/lib/action-state'

export async function verifyTransaction(transactionId: string) {
  const admin = await requireAdmin()
  const existing = await prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } })

  const recommendationToken = existing.type === 'RECOMMENDATION' ? randomUUID() : undefined

  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, status: 'PENDING' },
    data: {
      status: 'VERIFIED',
      verifiedById: admin.id,
      verifiedAt: new Date(),
      recommendationToken,
    },
  })

  if (result.count === 0) {
    return { error: 'Transaksi ini sudah diproses sebelumnya.' }
  }

  await prisma.auditLog.create({
    data: { entityType: 'transaction', entityId: transactionId, action: 'verify', adminId: admin.id, transactionId },
  })

  revalidatePath('/admin/transaksi')
}

export async function rejectTransaction(transactionId: string) {
  const admin = await requireAdmin()

  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, status: 'PENDING' },
    data: { status: 'REJECTED' },
  })

  if (result.count === 0) {
    return { error: 'Transaksi ini sudah diproses sebelumnya.' }
  }

  await prisma.auditLog.create({
    data: { entityType: 'transaction', entityId: transactionId, action: 'reject', adminId: admin.id, transactionId },
  })
  revalidatePath('/admin/transaksi')
}

export async function saveRecommendations(
  transactionId: string,
  _prevState: FormActionState,
  formData: FormData
) {
  const admin = await requireAdmin()

  const kosIds = formData.getAll('kosId').map(String)

  const trx = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!trx) return { error: 'Transaksi tidak ditemukan.' }
  if (trx.type !== 'RECOMMENDATION') return { error: 'Transaksi ini bukan tipe rekomendasi.' }
  if (trx.status !== 'VERIFIED') return { error: 'Transaksi belum diverifikasi.' }

  if (kosIds.length !== RECOMMENDATION_KOS_COUNT) {
    return { error: `Pilih tepat ${RECOMMENDATION_KOS_COUNT} kos sebelum menyimpan.` }
  }
  if (new Set(kosIds).size !== kosIds.length) {
    return { error: 'Ada kos yang terpilih dua kali.' }
  }

  // Validasi ulang di server: jangan percaya id yang dikirim dari client begitu saja
  // (bisa dimodifikasi lewat devtools), pastikan semuanya kos yang benar-benar ACTIVE.
  const validKos = await prisma.kos.findMany({
    where: { id: { in: kosIds }, status: 'ACTIVE' },
    select: { id: true },
  })
  if (validKos.length !== kosIds.length) {
    return { error: 'Salah satu kos yang dipilih sudah tidak aktif. Muat ulang halaman dan coba lagi.' }
  }

  await prisma.$transaction(async (tx) => {
    // Hapus pilihan lama dulu (kalau admin buka halaman ini lagi untuk mengedit),
    // baru simpan pilihan baru — supaya idempotent, tidak dobel atau nyangkut data lama.
    await tx.recommendationItem.deleteMany({ where: { transactionId } })
    await tx.recommendationItem.createMany({
      data: kosIds.map((kosId, index) => ({ transactionId, kosId, order: index })),
    })
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'transaction',
      entityId: transactionId,
      action: 'save_recommendations',
      changes: { kosIds },
      adminId: admin.id,
      transactionId,
    },
  })

  revalidatePath('/admin/transaksi')
  revalidatePath(`/admin/transaksi/${transactionId}/pilih-rekomendasi`)
  return { success: true }
}
