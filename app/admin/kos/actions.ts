'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { kosSchema, segmentsPayloadSchema, nearbyPayloadSchema } from '@/lib/validations/kos'
import { slugify } from '@/lib/slugify'
import { syncKosToIndex, kosIndex } from '@/lib/meilisearch'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { FormActionState } from '@/lib/action-state'
import { normalizeCityName } from '@/lib/constants'
import { toPublicUrl, deleteFromR2 } from '@/lib/r2'

const KOS_INDEX_INCLUDE = {
  segments: { include: { roomTypes: true, kosType: true } },
  nearby: true,
  media: { where: { isCover: true }, take: 1 },
} as const

function parseNearby(formData: FormData) {
  const raw = formData.get('nearbyJson')
  if (typeof raw !== 'string') {
    return { success: true as const, data: [] as import('@/lib/validations/kos').NearbyPayload }
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { success: false as const, error: 'Data nearby tidak valid.' }
  }

  const parsed = nearbyPayloadSchema.safeParse(json)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? 'Data nearby tidak valid.' }
  }
  return { success: true as const, data: parsed.data }
}

function parseForm(formData: FormData) {
  return kosSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    district: formData.get('district') || undefined,
    address: formData.get('address'),
    city: formData.get('city'),
    facilities: formData.getAll('facilities'),
    ownerId: formData.get('ownerId'),
  })
}

function parseSegments(formData: FormData) {
  const raw = formData.get('segmentsJson')
  if (typeof raw !== 'string') {
    return { success: false as const, error: 'Data segment/tipe kamar tidak ditemukan.' }
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { success: false as const, error: 'Data segment/tipe kamar tidak valid.' }
  }

  const parsed = segmentsPayloadSchema.safeParse(json)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? 'Data segment/tipe kamar tidak valid.' }
  }
  return { success: true as const, data: parsed.data }
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

  parsed.data.city = normalizeCityName(parsed.data.city)

  const segmentsResult = parseSegments(formData)
  if (!segmentsResult.success) return { error: segmentsResult.error }

  const nearbyResult = parseNearby(formData)
  if (!nearbyResult.success) return { error: nearbyResult.error }

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

  const kos = await prisma.$transaction(async (tx) => {
    const created = await tx.kos.create({
      data: {
        ...parsed.data,
        slug,
        status: 'ACTIVE',
        lastUpdatedAt: new Date(),
        updatedById: admin.id,
        segments: {
          create: segmentsResult.data.map((segment, segmentOrder) => ({
            kosTypeId: segment.kosTypeId,
            name: segment.name || null,
            order: segmentOrder,
            roomTypes: {
              create: segment.roomTypes.map((rt, rtOrder) => ({
                name: rt.name,
                priceMonthly: rt.priceMonthly,
                totalRooms: rt.totalRooms,
                availableRooms: rt.availableRooms,
                description: rt.description,
                facilities: rt.facilities,
                order: rtOrder,
              })),
            },
          })),
        },
        nearby: {
          create: nearbyResult.data.map((n, order) => ({
            name: n.name,
            distanceText: n.distanceText,
            category: n.category || null,
            order,
          })),
        },
      },
      include: KOS_INDEX_INCLUDE,
    })

    await tx.auditLog.create({
      data: { entityType: 'kos', entityId: created.id, action: 'create', adminId: admin.id, kosId: created.id },
    })

    return created
  })

  await syncKosToIndex(kos)

  revalidatePath('/admin/kos')
  redirect(`/admin/kos/${kos.id}/edit`)
}

export async function updateKos(kosId: string, _prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const admin = await requireAdmin()

  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  parsed.data.city = normalizeCityName(parsed.data.city)

  const segmentsResult = parseSegments(formData)
  if (!segmentsResult.success) return { error: segmentsResult.error }

  const nearbyResult = parseNearby(formData)
  if (!nearbyResult.success) return { error: nearbyResult.error }

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

  const kos = await prisma.$transaction(async (tx) => {
    const existingSegments = await tx.kosSegment.findMany({ where: { kosId }, select: { id: true } })
    const existingSegmentIds = new Set(existingSegments.map((s) => s.id))
    const incomingSegmentIds = new Set(segmentsResult.data.filter((s) => s.id).map((s) => s.id!))

    const segmentIdsToDelete = [...existingSegmentIds].filter((id) => !incomingSegmentIds.has(id))
    if (segmentIdsToDelete.length > 0) {
      await tx.kosSegment.deleteMany({ where: { id: { in: segmentIdsToDelete } } })
    }

    for (const [segmentOrder, segment] of segmentsResult.data.entries()) {
      const segmentData = { kosTypeId: segment.kosTypeId, name: segment.name || null, order: segmentOrder }

      const segmentRecord = segment.id
        ? await tx.kosSegment.update({ where: { id: segment.id }, data: segmentData })
        : await tx.kosSegment.create({ data: { ...segmentData, kosId } })

      const existingRoomTypes = await tx.kosRoomType.findMany({ where: { segmentId: segmentRecord.id }, select: { id: true } })
      const existingRoomTypeIds = new Set(existingRoomTypes.map((r) => r.id))
      const incomingRoomTypeIds = new Set(segment.roomTypes.filter((rt) => rt.id).map((rt) => rt.id!))

      const roomTypeIdsToDelete = [...existingRoomTypeIds].filter((id) => !incomingRoomTypeIds.has(id))
      if (roomTypeIdsToDelete.length > 0) {
        await tx.kosRoomType.deleteMany({ where: { id: { in: roomTypeIdsToDelete } } })
      }

      for (const [rtOrder, rt] of segment.roomTypes.entries()) {
        const roomTypeData = {
          name: rt.name,
          priceMonthly: rt.priceMonthly,
          totalRooms: rt.totalRooms,
          availableRooms: rt.availableRooms,
          description: rt.description,
          facilities: rt.facilities,
          order: rtOrder,
        }

        if (rt.id) {
          await tx.kosRoomType.update({ where: { id: rt.id }, data: roomTypeData })
        } else {
          await tx.kosRoomType.create({ data: { ...roomTypeData, segmentId: segmentRecord.id } })
        }
      }
    }

    const existingNearby = await tx.kosNearby.findMany({ where: { kosId }, select: { id: true } })
    const existingNearbyIds = new Set(existingNearby.map((n) => n.id))
    const incomingNearbyIds = new Set(nearbyResult.data.filter((n) => n.id).map((n) => n.id!))

    const nearbyIdsToDelete = [...existingNearbyIds].filter((id) => !incomingNearbyIds.has(id))
    if (nearbyIdsToDelete.length > 0) {
      await tx.kosNearby.deleteMany({ where: { id: { in: nearbyIdsToDelete } } })
    }

    for (const [order, n] of nearbyResult.data.entries()) {
      const nearbyData = { name: n.name, distanceText: n.distanceText, category: n.category || null, order }
      if (n.id) {
        await tx.kosNearby.update({ where: { id: n.id }, data: nearbyData })
      } else {
        await tx.kosNearby.create({ data: { ...nearbyData, kosId } })
      }
    }

    const updated = await tx.kos.update({
      where: { id: kosId },
      data: { ...parsed.data, status: 'ACTIVE', lastUpdatedAt: new Date(), updatedById: admin.id },
      include: KOS_INDEX_INCLUDE,
    })

    await tx.auditLog.create({
      data: { entityType: 'kos', entityId: kosId, action: 'update', adminId: admin.id, kosId },
    })

    return updated
  })

  await syncKosToIndex(kos)

  revalidatePath('/admin/kos')
  redirect('/admin/kos')
}

export async function hideKosManual(kosId: string) {
  const admin = await requireAdmin()
  const kos = await prisma.kos.update({ where: { id: kosId }, data: { status: 'HIDDEN_MANUAL' }, include: KOS_INDEX_INCLUDE })
  await syncKosToIndex(kos)
  await prisma.auditLog.create({ data: { entityType: 'kos', entityId: kosId, action: 'hide', adminId: admin.id, kosId } })
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

export async function deleteKosMedia(mediaId: string) {
  await requireAdmin()
  const media = await prisma.kosMedia.findUnique({ where: { id: mediaId } })
  if (!media) return

  await deleteFromR2(media.url)

  await prisma.kosMedia.delete({ where: { id: mediaId } })
  revalidatePath(`/admin/kos/${media.kosId}/edit`)
}