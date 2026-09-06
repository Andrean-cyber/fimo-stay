// app/admin/kos/pengaturan/kota/page.tsx
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { MergeCityForm } from './merge-city-form'

export default async function KelolaKotaPage() {
  await requireAdmin()

  const cities = await prisma.kos.groupBy({
    by: ['city'],
    _count: { _all: true },
    orderBy: { city: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/kos"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-fimo-navy"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Daftar Kos
        </Link>
        <h1 className="mt-1 text-xl font-bold text-fimo-navy sm:text-2xl">Kelola Kota</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gabungkan kota yang sama tapi tertulis beda (misal &quot;Malang&quot; dan &quot;Mlg&quot;).
        </p>
      </div>
      <MergeCityForm cities={cities.map((c) => ({ name: c.city, count: c._count._all }))} />
    </div>
  )
}