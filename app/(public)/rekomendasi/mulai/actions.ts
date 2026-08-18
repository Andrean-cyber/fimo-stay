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
    name: formData.get('name') || undefined,
    kosTypes: formData.getAll('kosTypes'),
    city: formData.get('city'),
    specificLocation: formData.get('specificLocation') || undefined,
    facilities: formData.getAll('facilities'),
    budget: formData.get('budget') || undefined,
    moveInDate: formData.get('moveInDate') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  let searcher = await prisma.searcher.findFirst({ where: { phone: parsed.data.phone } })
  if (!searcher) {
    searcher = await prisma.searcher.create({
      data: { phone: parsed.data.phone, name: parsed.data.name },
    })
  } else if (parsed.data.name && !searcher.name) {
    searcher = await prisma.searcher.update({
      where: { id: searcher.id },
      data: { name: parsed.data.name },
    })
  }

  const trx = await prisma.transaction.create({
    data: {
      type: 'RECOMMENDATION',
      amount: 100000,
      status: 'PENDING',
      searcherId: searcher.id,
      // Simpan sebagai JSON object, bukan plain text
      preferenceNotes: {
        kosTypes: parsed.data.kosTypes ?? [],
        city: parsed.data.city,
        specificLocation: parsed.data.specificLocation,
        budget: parsed.data.budget,
        facilities: parsed.data.facilities ?? [],
        moveInDate: parsed.data.moveInDate,
        notes: parsed.data.notes,
      },
    },
  })

  redirect(`/status/${trx.id}`)
}