import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { createKos } from '../actions'
import { KosForm } from '../kos-form'

export default async function NewKosPage() {
  await requireAdmin()
  const [kosTypes, owners] = await Promise.all([
    prisma.kosType.findMany({ orderBy: { name: 'asc' } }),
    prisma.owner.findMany({ orderBy: { name: 'asc' } }),
  ])

  // <KosForm action={createKos} owners={owners} kosTypes={kosTypes} submitLabel="Simpan Kos" />

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Tambah Kos</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Isi detail kos yang akan ditampilkan ke pencari.
        </p>
      </div>
      <KosForm action={createKos} owners={owners} kosTypes={kosTypes} submitLabel="Simpan Kos" />
    </div>
  )
}
