'use server'

import { prisma } from '@/lib/prisma'
import { recommendationSchema } from '@/lib/validations/public'
import { transactionRatelimit } from '@/lib/redis'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createRecommendationTransaction(formData: FormData) {
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  const turnstileToken = formData.get('turnstileToken') as string
  const humanVerified = await verifyTurnstileToken(turnstileToken, ip)
  if (!humanVerified) return { error: 'Verifikasi keamanan gagal, coba lagi.' }

  const { success } = await transactionRatelimit.limit(ip)
  if (!success) return { error: 'Terlalu banyak percobaan, coba lagi nanti' }

  const parsed = recommendationSchema.safeParse({
    phone: formData.get('phone'),
    preferenceNotes: formData.get('preferenceNotes'),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  let searcher = await prisma.searcher.findFirst({ where: { phone: parsed.data.phone } })
  if (!searcher) {
    searcher = await prisma.searcher.create({ data: { phone: parsed.data.phone } })
  }

  const trx = await prisma.transaction.create({
    data: {
      type: 'RECOMMENDATION',
      amount: 90000,
      status: 'PENDING',
      searcherId: searcher.id,
      preferenceNotes: parsed.data.preferenceNotes,
    },
  })

  redirect(`/status/${trx.id}`)
}