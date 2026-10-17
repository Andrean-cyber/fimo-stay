'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { ownerSchema } from '@/lib/validations/owner'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { FormActionState } from '@/lib/action-state'

function parseForm(formData: FormData) {
  return ownerSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address') || undefined,
    notes: formData.get('notes') || undefined,
  })
}

export async function createOwner(_prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const duplicate = await prisma.owner.findFirst({ where: { phone: parsed.data.phone } })
  if (duplicate) {
    return { error: `Nomor ${parsed.data.phone} sudah terdaftar atas nama "${duplicate.name}".` }
  }

  await prisma.owner.create({ data: parsed.data })
  revalidatePath('/admin/owners')
  redirect('/admin/owners')
}

export async function updateOwner(ownerId: string, _prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireAdmin()
  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const duplicate = await prisma.owner.findFirst({ where: { id: { not: ownerId }, phone: parsed.data.phone } })
  if (duplicate) {
    return { error: `Nomor ${parsed.data.phone} sudah terdaftar atas nama "${duplicate.name}".` }
  }

  await prisma.owner.update({ where: { id: ownerId }, data: parsed.data })
  revalidatePath('/admin/owners')
  redirect('/admin/owners')
}

export async function deleteOwner(ownerId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const kosCount = await prisma.kos.count({ where: { ownerId } })
  if (kosCount > 0) {
    return { error: `Owner ini masih punya ${kosCount} kos terdaftar. Pindahkan/hapus kos-nya dulu sebelum menghapus owner ini.` }
  }
  await prisma.owner.delete({ where: { id: ownerId } })
  revalidatePath('/admin/owners')
  redirect('/admin/owners')
}