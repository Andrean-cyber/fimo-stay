'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { syncKosToIndex } from '@/lib/meilisearch'
import { revalidatePath } from 'next/cache'
import { segmentSchema, roomTypeSchema } from '@/lib/validations/kos'

async function touchAndSync(kosId: string, adminId: string) {
  const kos = await prisma.kos.update({
    where: { id: kosId },
    data: { lastUpdatedAt: new Date(), updatedById: adminId },
    include: { segments: { include: { roomTypes: true } } },
  })
  await syncKosToIndex(kos)
  revalidatePath(`/admin/kos/${kosId}/edit`)
}

export async function createSegment(kosId: string, input: unknown) {
  const admin = await requireAdmin()
  const parsed = segmentSchema.omit({ id: true }).safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  await prisma.kosSegment.create({
    data: {
      kosId,
      kosTypeId: parsed.data.kosTypeId,
      name: parsed.data.name || null,
      roomTypes: { create: parsed.data.roomTypes.map((rt, order) => ({ ...rt, order })) },
    },
  })
  await prisma.auditLog.create({ data: { entityType: 'kos_segment', entityId: kosId, action: 'create', adminId: admin.id, kosId } })
  await touchAndSync(kosId, admin.id)
  return {}
}

export async function updateSegment(segmentId: string, input: unknown) {
  const admin = await requireAdmin()
  const parsed = segmentSchema.omit({ id: true, roomTypes: true }).safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const segment = await prisma.kosSegment.update({
    where: { id: segmentId },
    data: { kosTypeId: parsed.data.kosTypeId, name: parsed.data.name || null },
  })
  await prisma.auditLog.create({ data: { entityType: 'kos_segment', entityId: segmentId, action: 'update', adminId: admin.id, kosId: segment.kosId } })
  await touchAndSync(segment.kosId, admin.id)
  return {}
}

export async function deleteSegment(segmentId: string) {
  const admin = await requireAdmin()
  const segment = await prisma.kosSegment.findUniqueOrThrow({ where: { id: segmentId } })

  const remaining = await prisma.kosSegment.count({ where: { kosId: segment.kosId, id: { not: segmentId } } })
  if (remaining === 0) return { error: 'Tidak bisa hapus segment terakhir. Kos harus punya minimal 1 segment.' }

  await prisma.kosSegment.delete({ where: { id: segmentId } })
  await prisma.auditLog.create({ data: { entityType: 'kos_segment', entityId: segmentId, action: 'delete', adminId: admin.id, kosId: segment.kosId } })
  await touchAndSync(segment.kosId, admin.id)
  return {}
}

export async function createRoomType(segmentId: string, input: unknown) {
  const admin = await requireAdmin()
  const parsed = roomTypeSchema.omit({ id: true }).safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const segment = await prisma.kosSegment.findUniqueOrThrow({ where: { id: segmentId } })
  await prisma.kosRoomType.create({ data: { ...parsed.data, segmentId } })
  await prisma.auditLog.create({ data: { entityType: 'kos_room_type', entityId: segmentId, action: 'create', adminId: admin.id, kosId: segment.kosId } })
  await touchAndSync(segment.kosId, admin.id)
  return {}
}

export async function updateRoomType(roomTypeId: string, input: unknown) {
  const admin = await requireAdmin()
  const parsed = roomTypeSchema.omit({ id: true }).safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const roomType = await prisma.kosRoomType.update({ where: { id: roomTypeId }, data: parsed.data, include: { segment: true } })
  await prisma.auditLog.create({ data: { entityType: 'kos_room_type', entityId: roomTypeId, action: 'update', adminId: admin.id, kosId: roomType.segment.kosId } })
  await touchAndSync(roomType.segment.kosId, admin.id)
  return {}
}

export async function deleteRoomType(roomTypeId: string) {
  const admin = await requireAdmin()
  const roomType = await prisma.kosRoomType.findUniqueOrThrow({ where: { id: roomTypeId }, include: { segment: true } })

  const remaining = await prisma.kosRoomType.count({ where: { segmentId: roomType.segmentId, id: { not: roomTypeId } } })
  if (remaining === 0) return { error: 'Tidak bisa hapus tipe kamar terakhir di segment ini. Hapus segmentnya kalau memang tidak dipakai.' }

  await prisma.kosRoomType.delete({ where: { id: roomTypeId } })
  await prisma.auditLog.create({ data: { entityType: 'kos_room_type', entityId: roomTypeId, action: 'delete', adminId: admin.id, kosId: roomType.segment.kosId } })
  await touchAndSync(roomType.segment.kosId, admin.id)
  return {}
}