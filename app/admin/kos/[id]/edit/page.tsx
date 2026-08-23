import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { updateKos, hideKosManual, unhideKosManual } from '../../actions'
import { KosForm } from '../../kos-form'
import { UploadFoto } from '../upload-foto'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { DeleteFotoButton } from './delete-foto-button'
import { toPublicUrl } from '@/lib/r2'

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

  const isHiddenManual = kos.status === 'HIDDEN_MANUAL'

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Edit Kos</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">Perbarui detail {kos.name}.</p>
      </div>

      <KosForm action={updateKos.bind(null, kos.id)} owners={owners} kosTypes={kosTypes} defaults={kos} submitLabel="Simpan Perubahan" />

      <div className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 sm:text-base">Foto Kos</h2>
        {kos.media.length > 0 ? (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {kos.media.map((m) => (
              <div key={m.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={toPublicUrl(m.url)} alt="" className="h-24 w-full rounded-xl object-cover sm:h-28 lg:h-32" />
                <DeleteFotoButton mediaId={m.id} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-fimo-gray py-8 text-center">
            <PhotoIcon className="h-5 w-5 text-gray-300" />
            <p className="text-xs text-gray-400 sm:text-sm">Belum ada foto</p>
          </div>
        )}
        <UploadFoto kosId={kos.id} />
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6 lg:p-8">
        <h2 className="mb-1 text-sm font-semibold text-red-900 sm:text-base">Zona Berbahaya</h2>
        <p className="mb-4 text-xs text-red-700 sm:text-sm">
          {isHiddenManual
            ? 'Kos ini saat ini sedang disembunyikan manual dan tidak tampil di pencarian publik.'
            : 'Sembunyikan kos ini dari pencarian publik secara manual.'}
        </p>
        {isHiddenManual ? (
          <form action={unhideKosManual.bind(null, kos.id)}>
            <button
              type="submit"
              className="rounded-xl border border-green-300 bg-white px-4 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 sm:text-sm"
            >
              Aktifkan Kembali
            </button>
          </form>
        ) : (
          <form action={hideKosManual.bind(null, kos.id)}>
            <button
              type="submit"
              className="rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 sm:text-sm"
            >
              Sembunyikan Manual
            </button>
          </form>
        )}
      </div>
    </div>
  )
}