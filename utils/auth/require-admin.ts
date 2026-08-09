import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const profile = await prisma.adminProfile.findUnique({ where: { id: user.id } })
  if (!profile) redirect('/admin/login')

  return profile
}

export async function requireSuperadmin() {
  const profile = await requireAdmin()
  if (profile.role !== 'SUPERADMIN') redirect('/admin')
  return profile
}

export async function requireAdminApi() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return prisma.adminProfile.findUnique({ where: { id: user.id } })
  }