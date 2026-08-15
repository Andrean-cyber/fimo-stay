import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { updateOwner } from '../../actions'
import { OwnerForm } from '../../owner-form'

export default async function EditOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const owner = await prisma.owner.findUnique({ where: { id } })
  if (!owner) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Edit Owner</h1>
      <OwnerForm action={updateOwner.bind(null, owner.id)} defaults={owner} submitLabel="Simpan Perubahan" />
    </div>
  )
}
