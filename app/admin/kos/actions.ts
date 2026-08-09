'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { kosSchema } from '@/lib/validations/kos'
import { slugify } from '@/lib/slugify'
import { syncKosToIndex, kosIndex } from '@/lib/meilisearch'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { FormActionState } from '@/lib/action-state'

function parseForm(formData: FormData) {
  return kosSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    address: formData.get('address'),
    city: formData.get('city'),
    priceMonthly: formData.get('priceMonthly'),
    roomType: formData.get('roomType') || undefined,
    facilities: formData.getAll('facilities'),
    ownerId: formData.get('ownerId'),
  })
}

async function generateUniqueSlug(name: string) {
  const base = slugify(name)
  let slug = base
  let counter = 2
  while (await prisma.kos.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`
    counter++
  }
  return slug
}

export async function createKos(_prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const admin = await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const duplicate = await prisma.kos.findFirst({
    where: {
      name: { equals: parsed.data.name, mode: 'insensitive' },
      city: { equals: parsed.data.city, mode: 'insensitive' },
    },
  })
  if (duplicate) {
    return { error: `Kos "${parsed.data.name}" di kota ${parsed.data.city} sudah terdaftar. Tambahkan pembeda, misal nama jalan/komplek.` }
  }

  const slug = await generateUniqueSlug(parsed.data.name)

  const kos = await prisma.kos.create({
    data: { ...parsed.data, slug, status: 'ACTIVE', lastUpdatedAt: new Date(), updatedById: admin.id },
  })

  await syncKosToIndex(kos)
  await prisma.auditLog.create({
    data: { entityType: 'kos', entityId: kos.id, action: 'create', adminId: admin.id, kosId: kos.id },
  })

  revalidatePath('/admin/kos')
  redirect(`/admin/kos/${kos.id}/edit`)
}

export async function updateKos(kosId: string, _prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const admin = await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const duplicate = await prisma.kos.findFirst({
    where: {
      id: { not: kosId },
      name: { equals: parsed.data.name, mode: 'insensitive' },
      city: { equals: parsed.data.city, mode: 'insensitive' },
    },
  })
  if (duplicate) {
    return { error: `Kos "${parsed.data.name}" di kota ${parsed.data.city} sudah terdaftar.` }
  }

  const kos = await prisma.kos.update({
    where: { id: kosId },
    data: { ...parsed.data, status: 'ACTIVE', lastUpdatedAt: new Date(), updatedById: admin.id },
  })

  await syncKosToIndex(kos)
  await prisma.auditLog.create({
    data: { entityType: 'kos', entityId: kosId, action: 'update', adminId: admin.id, kosId },
  })

  revalidatePath('/admin/kos')
  redirect('/admin/kos')
}

export async function hideKosManual(kosId: string) {
  const admin = await requireAdmin()
  const kos = await prisma.kos.update({ where: { id: kosId }, data: { status: 'HIDDEN_MANUAL' } })
  await syncKosToIndex(kos)
  await prisma.auditLog.create({
    data: { entityType: 'kos', entityId: kosId, action: 'hide', adminId: admin.id, kosId },
  })
  revalidatePath('/admin/kos')
  revalidatePath(`/admin/kos/${kosId}/edit`)
}

export async function attachKosMedia(kosId: string, url: string, isCover = false) {
  await requireAdmin()
  await prisma.kosMedia.create({ data: { kosId, url, isCover } })
  revalidatePath(`/admin/kos/${kosId}/edit`)
}

export async function deleteKos(kosId: string): Promise<{ error?: string }> {
  await requireAdmin()

  const [transactionCount, recommendationCount] = await Promise.all([
    prisma.transaction.count({ where: { targetKosId: kosId } }),
    prisma.recommendationItem.count({ where: { kosId } }),
  ])

  if (transactionCount > 0 || recommendationCount > 0) {
    return { error: 'Kos ini sudah pernah dipakai di transaksi/rekomendasi, tidak bisa dihapus permanen. Gunakan "Sembunyikan Manual" saja.' }
  }

  await kosIndex.deleteDocument(kosId).catch(() => {})
  await prisma.kos.delete({ where: { id: kosId } })

  revalidatePath('/admin/kos')
  redirect('/admin/kos')
}