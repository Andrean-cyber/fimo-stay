'use server'

import { prisma } from '@/lib/prisma'
import { selfSearchSchema } from '@/lib/validations/public'
import { transactionRatelimit } from '@/lib/redis'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createSelfSearchTransaction(kosId: string, formData: FormData) {
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  const turnstileToken = formData.get('turnstileToken') as string
  const humanVerified = await verifyTurnstileToken(turnstileToken, ip)
  if (!humanVerified) return { error: 'Verifikasi keamanan gagal, coba lagi.' }

  const { success } = await transactionRatelimit.limit(ip)
  if (!success) return { error: 'Terlalu banyak percobaan, coba lagi nanti' }

  const parsed = selfSearchSchema.safeParse({
    phone: formData.get('phone'),
    kosId,
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  let searcher = await prisma.searcher.findFirst({ where: { phone: parsed.data.phone } })
  if (!searcher) {
    searcher = await prisma.searcher.create({ data: { phone: parsed.data.phone } })
  }

  const trx = await prisma.transaction.create({
    data: {
      type: 'SELF_SEARCH',
      amount: 30000,
      status: 'PENDING',
      searcherId: searcher.id,
      targetKosId: parsed.data.kosId,
    },
  })

  redirect(`/status/${trx.id}`)
}