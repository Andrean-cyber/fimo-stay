import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, ImageOff } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'
import { SelfSearchForm } from './self-search-form'

export default async function KosDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const kos = await prisma.kos.findUnique({
    where: { slug },
    include: { media: { orderBy: { order: 'asc' } } },
  })

  // sengaja cek status manual di sini — meskipun Prisma bypass RLS,
  // kos yang tidak ACTIVE tetap tidak boleh terlihat publik
  if (!kos || kos.status !== 'ACTIVE') notFound()

  const [cover, ...restMedia] = kos.media

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/kos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-fimo-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke pencarian
        </Link>

        {/* Galeri foto */}
        {kos.media.length > 0 ? (
          <div className="mb-6 grid grid-cols-4 grid-rows-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url}
              alt={kos.name}
              className="col-span-4 h-56 w-full rounded-xl object-cover sm:col-span-2 sm:row-span-2 sm:h-full"
            />
            {restMedia.slice(0, 4).map((m: any) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={m.id}
                src={m.url}
                alt={kos.name}
                className="col-span-2 h-28 w-full rounded-xl object-cover sm:col-span-1"
              />
            ))}
          </div>
        ) : (
          <div className="mb-6 flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-fimo-gray/60 text-gray-400">
            <ImageOff className="h-6 w-6" />
            <p className="text-sm">Belum ada foto</p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-fimo-navy">{kos.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="h-4 w-4 shrink-0" />
          {kos.address}, {kos.city}
        </p>
        <p className="mt-3 text-xl font-bold text-fimo-navy">
          Rp{kos.priceMonthly.toLocaleString('id-ID')}
          <span className="text-sm font-normal text-gray-500"> / bulan</span>
        </p>

        {kos.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {kos.description}
          </p>
        )}

        {kos.facilities.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Fasilitas</h2>
            <div className="flex flex-wrap gap-2">
              {kos.facilities.map((f: string) => (
                <span
                  key={f}
                  className="rounded-full bg-fimo-blue/10 px-3 py-1 text-sm text-fimo-navy"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-fimo-gray bg-fimo-gray/30 p-5">
          <p className="mb-3 text-sm text-gray-600">
            Kontak owner tersembunyi. Buka kontak untuk melihat nomor dan menghubungi langsung.
          </p>
          <SelfSearchForm kosId={kos.id} />
        </div>
      </main>
    </div>
  )
}