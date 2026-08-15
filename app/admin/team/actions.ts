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

// Cari user di Supabase Auth berdasarkan email. Dipakai untuk mendeteksi
// akun "yatim" — user yang ada di Supabase Auth tapi tidak (lagi) punya
// baris di tabel adminProfile, biasanya sisa dari penghapusan admin yang
// gagal separuh jalan.
async function findAuthUserByEmail(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string
) {
  const target = email.toLowerCase()
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('findAuthUserByEmail: gagal list users', error)
      return null
    }
    const found = data.users.find((u) => u.email?.toLowerCase() === target)
    if (found) return found
    if (data.users.length < perPage) return null
    page += 1
  }
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
    // Kasus khusus: email sudah punya akun di Supabase Auth meski tidak
    // ada profilnya di adminProfile — biasanya akun "yatim" peninggalan
    // penghapusan admin yang gagal separuh jalan. Kalau memang itu
    // penyebabnya, sambungkan lagi otomatis daripada cuma menampilkan
    // error mentah ke superadmin.
    if (error.code === 'email_exists') {
      const orphanUser = await findAuthUserByEmail(adminClient, email)

      if (orphanUser) {
        await prisma.adminProfile.create({
          data: {
            id: orphanUser.id,
            email,
            fullName,
            role: 'STAFF',
          },
        })

        await prisma.auditLog.create({
          data: {
            entityType: 'admin_profile',
            entityId: orphanUser.id,
            action: 'relink_orphan_account',
            changes: { email, fullName },
            adminId: me.id,
          },
        })

        revalidatePath('/admin/team')
        // Akun Auth-nya sudah ada sebelumnya (kemungkinan sudah pernah set
        // password juga), jadi tidak perlu kirim undangan baru — orang ini
        // biasanya masih bisa login pakai password lama. Kalau lupa, dia
        // tinggal pakai "Lupa Password" di halaman login.
        return { success: true }
      }

      console.error('inviteAdmin: email_exists tapi tidak ditemukan di Supabase Auth', email)
      return {
        error:
          'Email ini sudah terdaftar di sistem login tapi datanya tidak ditemukan. Hubungi developer.',
      }
    }

    console.error('inviteAdmin error:', error)
    return { error: 'Gagal mengirim undangan. Coba lagi atau hubungi developer.' }
  }

  // Tidak perlu prisma.adminProfile.create() di sini — baris admin_profiles
  // dibuat otomatis lewat trigger DB saat user baru masuk ke auth.users
  // (lihat komentar di schema.prisma). Kalau di-insert manual juga, akan
  // bentrok dengan trigger dan berpotensi unique constraint error.

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

  const found = await prisma.adminProfile.findUnique({ where: { id: adminId } })
  if (!found) return { error: 'Akun tidak ditemukan.' }

  if (found.role === 'SUPERADMIN') {
    const count = await prisma.adminProfile.count({ where: { role: 'SUPERADMIN' } })
    if (count <= 1) return { error: 'Tidak bisa menghapus superadmin terakhir.' }
  }

  // PENTING: hapus dulu di Supabase Auth SEBELUM menyentuh adminProfile.
  // Kalau langkah ini gagal, adminProfile tidak disentuh sama sekali —
  // jadi tidak akan ada lagi kondisi "yatim" (profil hilang, tapi akun
  // login di Supabase Auth masih ada dan masih bisa dipakai orang lain
  // untuk login). Ini kebalikan dari urutan sebelumnya.
  const adminClient = createAdminClient()
  const { error: authError } = await adminClient.auth.admin.deleteUser(adminId)
  if (authError) {
    console.error('removeAdmin: gagal hapus user di Supabase Auth untuk id', adminId, authError)
    return {
      error: 'Gagal menghapus akun login. Coba lagi, atau hubungi developer kalau terus berulang.',
    }
  }

  // Akun Auth sudah berhasil dihapus — sekarang aman untuk hapus profil +
  // catat audit log. Kalau langkah ini yang gagal, sisa datanya cuma baris
  // adminProfile yatim (tanpa akses login sama sekali) — jauh lebih aman
  // dibanding sebaliknya, dan gampang dibersihkan manual dari database.
  try {
    await prisma.$transaction(
      async (tx) => {
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
    console.error('removeAdmin: akun Auth sudah terhapus tapi gagal hapus profil', adminId, err)
    return {
      error:
        'Akun login sudah dihapus, tapi profil di database gagal dihapus. Hubungi developer untuk membersihkan data ini secara manual.',
    }
  }

  revalidatePath('/admin/team')
  return { success: true }
}

export async function removeAdminAction(adminId: string): Promise<void | { error?: string }> {
  const res = await removeAdmin(adminId)
  if (res?.error) return { error: res.error }
  return undefined
}
