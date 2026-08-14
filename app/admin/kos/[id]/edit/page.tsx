import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { updateKos, hideKosManual } from '../../actions'
import { KosForm } from '../../kos-form'
import { UploadFoto } from '../upload-foto'
import { ImageIcon } from 'lucide-react'

export default async function EditKosPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const [kos, kosTypes, owners] = await Promise.all([
    prisma.kos.findUnique({
      where: { id },
      include: {
        segments: { include: { roomTypes: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        nearby: { orderBy: { order: 'asc' } },
        media: true,
      },
    }),
    prisma.kosType.findMany({ orderBy: { name: 'asc' } }),
    prisma.owner.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!kos) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fimo-navy">Edit Kos</h1>
        <p className="mt-1 text-sm text-gray-500">Perbarui detail {kos.name}.</p>
      </div>

      <KosForm action={updateKos.bind(null, kos.id)} owners={owners} kosTypes={kosTypes} defaults={kos} submitLabel="Simpan Perubahan" />

      <div className="rounded-2xl border border-fimo-gray bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Foto Kos</h2>
        {kos.media.length > 0 ? (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {kos.media.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={m.url} alt="" className="h-24 w-full rounded-xl object-cover" />
            ))}
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-fimo-gray py-8 text-center">
            <ImageIcon className="h-5 w-5 text-gray-300" />
            <p className="text-sm text-gray-400">Belum ada foto</p>
          </div>
        )}
        <UploadFoto kosId={kos.id} />
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-1 font-semibold text-red-900">Zona Berbahaya</h2>
        <p className="mb-4 text-sm text-red-700">
          Sembunyikan kos ini dari pencarian publik secara manual.
          {kos.status === 'HIDDEN_MANUAL' && ' Kos ini saat ini sedang disembunyikan manual.'}
        </p>
        <form action={hideKosManual.bind(null, kos.id)}>
          <button
            type="submit"
            disabled={kos.status === 'HIDDEN_MANUAL'}
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {kos.status === 'HIDDEN_MANUAL' ? 'Sudah Disembunyikan' : 'Sembunyikan Manual'}
          </button>
        </form>
      </div>
    </div>
  )
}
