import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import { RECOMMENDATION_KOS_COUNT } from '@/lib/constants'
import { PilihRekomendasiForm } from './pilih-rekomendasi-form'
import { parsePreference } from '@/lib/format-preference'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default async function PilihRekomendasiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const trx = await prisma.transaction.findUnique({
    where: { id },
    include: { searcher: true, recommendationItems: true },
  })
  if (!trx) notFound()

  const pref = parsePreference(trx.preferenceNotes)

  // Filter di DB hanya kota (hard filter) — sisanya scoring di JS
  // Pakai contains agar "Malang" match "Kota Malang" dll
  const kosAktifRaw = await prisma.kos.findMany({
    where: {
      status: 'ACTIVE',
      ...(pref?.city
        ? {
            city: {
              contains: pref.city.trim(),
              mode: 'insensitive' as const,
            },
          }
        : {}),
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      city: true,
      district: true,
      address: true,
      facilities: true,
      nearby: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { name: true, distanceText: true },
      },
      segments: {
        select: {
          kosType: { select: { name: true } },
          roomTypes: {
            where: { isActive: true },
            select: { priceMonthly: true },
          },
        },
      },
    },
  })

  const kosAktif = kosAktifRaw
    .map((k) => {
      const allPrices = k.segments.flatMap((s) =>
        s.roomTypes.map((rt) => rt.priceMonthly)
      )
      const priceMonthly = allPrices.length > 0 ? Math.min(...allPrices) : 0
      const kosTypeNames = k.segments.map((s) => s.kosType.name)
      const roomType = kosTypeNames[0] ?? null

      // Scoring — semakin tinggi semakin cocok
      let matchScore = 0
      const matchReasons: string[] = []

      // Jenis kos (bobot tinggi)
      if (pref?.kosTypes?.length) {
        const matched = pref.kosTypes.filter((t) => kosTypeNames.includes(t))
        if (matched.length > 0) {
          matchScore += 4
          matchReasons.push(matched.join('/'))
        }
      }

      // Budget — harga termurah harus ≤ budget user (bobot tinggi)
      if (pref?.budget && priceMonthly > 0) {
        if (priceMonthly <= pref.budget) {
          matchScore += 3
          matchReasons.push(`Rp${priceMonthly.toLocaleString('id-ID')} ≤ budget`)
        } else {
          // Over budget — kurangi skor tapi tetap tampil
          matchScore -= 2
        }
      }

      // Fasilitas (bobot per item)
      if (pref?.facilities?.length) {
        const matched = pref.facilities.filter((f) =>
          k.facilities.map((kf) => kf.toLowerCase()).includes(f.toLowerCase())
        )
        if (matched.length > 0) {
          matchScore += matched.length
          matchReasons.push(`${matched.length}/${pref.facilities.length} fasilitas`)
        }
      }

      // Lokasi spesifik (mis. "Dekat UB") — sebelumnya cuma ditampilkan
      // sebagai badge ringkasan, tidak pernah dipakai untuk mencocokkan.
      // Sekarang dicek terhadap kecamatan (district) dan daftar nearby kos.
      if (pref?.specificLocation) {
        const loc = pref.specificLocation.trim().toLowerCase()
        const districtMatch = k.district?.toLowerCase().includes(loc) ?? false
        const nearbyMatch = k.nearby.some((n) => n.name.toLowerCase().includes(loc))
        if (districtMatch || nearbyMatch) {
          matchScore += 3
          matchReasons.push(`Dekat ${pref.specificLocation}`)
        }
      }

      return {
        id: k.id,
        name: k.name,
        city: k.city,
        district: k.district,
        address: k.address,
        facilities: k.facilities,
        nearby: k.nearby,
        priceMonthly,
        roomType,
        matchScore,
        matchReasons,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)

  const alreadySelectedIds = trx.recommendationItems.map((r) => r.kosId)

  // Ringkasan preferensi user untuk ditampilkan di header
  const prefSummaryParts = [
    pref?.city,
    pref?.specificLocation ? `${pref.specificLocation}` : null,
    pref?.kosTypes?.join('/'),
    pref?.budget
      ? `≤ Rp${Number(pref.budget).toLocaleString('id-ID')}`
      : null,
    pref?.facilities?.length ? `${pref.facilities.length} fasilitas` : null,
  ].filter(Boolean)

  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <Link
        href="/admin/transaksi"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-fimo-navy lg:text-[15px]"
      >
        <ArrowLeftIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
        Kembali ke daftar transaksi
      </Link>

      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">
          Pilih {RECOMMENDATION_KOS_COUNT} Kos untuk Rekomendasi
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Untuk {trx.searcher.phone}
        </p>
        {prefSummaryParts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prefSummaryParts.map((part) => (
              <span
                key={part}
                className="rounded-full bg-fimo-navy/10 px-2.5 py-0.5 text-xs font-medium text-fimo-navy"
              >
                {part}
              </span>
            ))}
          </div>
        )}
      </div>

      <PilihRekomendasiForm
        transactionId={trx.id}
        kosList={kosAktif}
        initialSelectedIds={alreadySelectedIds}
        requiredCount={RECOMMENDATION_KOS_COUNT}
      />
    </div>
  )
}