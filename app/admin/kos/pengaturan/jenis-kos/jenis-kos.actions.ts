"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getKosTypes() {
  return prisma.kosType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { segments: true } } },
  })
}

export async function createKosType(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return { error: "Nama jenis kos wajib diisi" }

  const existing = await prisma.kosType.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  })
  if (existing) return { error: "Jenis kos ini sudah ada" }

  await prisma.kosType.create({ data: { name: trimmed } })
  revalidatePath("/admin/pengaturan/jenis-kos")
  return { success: true }
}

export async function renameKosType(id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) return { error: "Nama jenis kos wajib diisi" }

  const existing = await prisma.kosType.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" }, NOT: { id } },
  })
  if (existing) return { error: "Jenis kos ini sudah ada" }

  await prisma.kosType.update({ where: { id }, data: { name: trimmed } })
  revalidatePath("/admin/pengaturan/jenis-kos")
  return { success: true }
}

export async function deleteKosType(id: string) {
  const usageCount = await prisma.kosSegment.count({ where: { kosTypeId: id } })
  if (usageCount > 0) {
    return { error: `Jenis kos masih dipakai di ${usageCount} segment, tidak bisa dihapus` }
  }
  await prisma.kosType.delete({ where: { id } })
  revalidatePath("/admin/pengaturan/jenis-kos")
  return { success: true }
}