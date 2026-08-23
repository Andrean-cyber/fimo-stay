import { prisma } from '@/lib/prisma'

export async function countKosNeedConfirmation(thresholdDays = 5) {
  const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000)
  return prisma.kos.count({
    where: {
      status: { in: ['ACTIVE', 'HIDDEN_STALE'] },
      lastUpdatedAt: { lt: thresholdDate },
    },
  })
}