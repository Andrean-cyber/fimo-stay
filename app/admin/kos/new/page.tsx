import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { createKos } from '../actions'
import { KosForm } from '../kos-form'

export default async function NewKosPage() {
  await requireAdmin()
  const owners = await prisma.owner.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fimo-navy">Tambah Kos</h1>
        <p className="mt-1 text-sm text-gray-500">Isi detail kos yang akan ditampilkan ke pencari.</p>
      </div>
      <KosForm action={createKos} owners={owners} submitLabel="Simpan" />
    </div>
  )
}