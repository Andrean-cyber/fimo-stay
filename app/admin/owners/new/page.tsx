import { requireAdmin } from '@/utils/auth/require-admin'
import { createOwner } from '../actions'
import { OwnerForm } from '../owner-form'

export default async function NewOwnerPage() {
  await requireAdmin()
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Tambah Owner</h1>
      <OwnerForm action={createOwner} submitLabel="Simpan" />
    </div>
  )
}
