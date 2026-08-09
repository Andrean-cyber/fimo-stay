'use server'

import { prisma } from '@/lib/prisma'
import { requireSuperadmin } from '@/utils/auth/require-admin'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { FormActionState } from '@/lib/action-state'
import { Prisma } from '@prisma/client'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function inviteAdmin(_prevState: FormActionState, formData: FormData) {
  const me = await requireSuperadmin()

  const rawEmail = (formData.get('email') as string) ?? ''
  const fullName = ((formData.get('fullName') as string) ?? '').trim()
  const email = rawEmail.trim().toLowerCase()

  if (!email || !isValidEmail(email)) {
    return { error: 'Format email tidak valid.' }
  }
  if (!fullName) {
    return { error: 'Nama lengkap wajib diisi.' }
  }

  const existing = await prisma.adminProfile.findFirst({ where: { email } })
  if (existing) {
    return { error: 'Email ini sudah terdaftar sebagai admin.' }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
  })
  if (error) {
    console.error('inviteAdmin error:', error)
    return { error: 'Gagal mengirim undangan. Coba lagi atau hubungi developer.' }
  }

  await prisma.auditLog.create({
    data: {
      entityType: 'admin_profile',
      entityId: data.user?.id ?? email,
      action: 'invite',
      changes: { email, fullName },
      adminId: me.id,
    },
  })

  revalidatePath('/admin/team')
  return { success: true }
}

export async function updateAdminRole(adminId: string, newRole: 'STAFF' | 'SUPERADMIN') {
  const me = await requireSuperadmin()

  try {
    await prisma.$transaction(
      async (tx) => {
        const target = await tx.adminProfile.findUnique({ where: { id: adminId } })
        if (!target) throw new Error('NOT_FOUND')

        if (target.role === 'SUPERADMIN' && newRole === 'STAFF') {
          const count = await tx.adminProfile.count({ where: { role: 'SUPERADMIN' } })
          if (count <= 1) throw new Error('LAST_SUPERADMIN')
        }

        if (target.role === newRole) return

        await tx.adminProfile.update({ where: { id: adminId }, data: { role: newRole } })

        await tx.auditLog.create({
          data: {
            entityType: 'admin_profile',
            entityId: adminId,
            action: 'update_role',
            changes: { from: target.role, to: newRole },
            adminId: me.id,
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'LAST_SUPERADMIN') {
      return { error: 'Tidak bisa menurunkan superadmin terakhir.' }
    }
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      return { error: 'Akun tidak ditemukan.' }
    }
    console.error('updateAdminRole error:', err)
    return { error: 'Terjadi konflik, silakan coba lagi.' }
  }

  revalidatePath('/admin/team')
  return { success: true }
}

export async function removeAdmin(adminId: string) {
  const me = await requireSuperadmin()
  if (me.id === adminId) return { error: 'Tidak bisa menghapus akun sendiri.' }

  try {
    await prisma.$transaction(
      async (tx) => {
        const found = await tx.adminProfile.findUnique({ where: { id: adminId } })
        if (!found) throw new Error('NOT_FOUND')

        if (found.role === 'SUPERADMIN') {
          const count = await tx.adminProfile.count({ where: { role: 'SUPERADMIN' } })
          if (count <= 1) throw new Error('LAST_SUPERADMIN')
        }

        await tx.auditLog.create({
          data: {
            entityType: 'admin_profile',
            entityId: adminId,
            action: 'remove',
            changes: { email: found.email, fullName: found.fullName, role: found.role },
            adminId: me.id,
          },
        })

        await tx.adminProfile.delete({ where: { id: adminId } })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'LAST_SUPERADMIN') {
      return { error: 'Tidak bisa menghapus superadmin terakhir.' }
    }
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      return { error: 'Akun tidak ditemukan.' }
    }
    console.error('removeAdmin error:', err)
    return { error: 'Terjadi konflik, silakan coba lagi.' }
  }

  const adminClient = createAdminClient()
  const { error: authError } = await adminClient.auth.admin.deleteUser(adminId)
  if (authError) {
    console.error('removeAdmin: gagal hapus user di Supabase Auth untuk id', adminId, authError)
    return {
      error:
        'Profil admin sudah dihapus, tapi gagal menghapus akun login. Hubungi developer untuk membersihkan akun ini secara manual.',
    }
  }

  revalidatePath('/admin/team')
  return { success: true }
}
