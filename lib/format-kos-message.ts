import { getReferenceCode } from '@/lib/constants'

type RoomTypeDetail = {
  name: string
  priceMonthly: number
  availableRooms: number | null
  description: string | null
  facilities: string[]
}
type SegmentDetail = { name: string | null; kosTypeName: string; roomTypes: RoomTypeDetail[] }
type NearbyDetail = { name: string; distanceText: string }

export type KosMessageDetail = {
  name: string
  description: string | null
  city: string
  district: string | null
  address: string
  facilities: string[]
  ownerName: string
  ownerPhone: string
  segments: SegmentDetail[]
  nearby: NearbyDetail[]
}

function formatKosBlock(kos: KosMessageDetail, index?: number): string {
  const lines: string[] = []
  lines.push(index ? `${index}. ${kos.name}` : kos.name)
  if (kos.description) lines.push(kos.description)
  lines.push(`Alamat: ${kos.address}, ${kos.district ? `${kos.district}, ` : ''}${kos.city}`)
  lines.push(`Kontak pemilik: ${kos.ownerName} - ${kos.ownerPhone}`)

  for (const seg of kos.segments) {
    const segLabel = seg.name ? `${seg.kosTypeName} - ${seg.name}` : seg.kosTypeName
    lines.push(`Tipe kamar (${segLabel}):`)
    for (const rt of seg.roomTypes) {
      const stock = rt.availableRooms != null ? ` (sisa ${rt.availableRooms} kamar)` : ''
      lines.push(`   - ${rt.name}: Rp${rt.priceMonthly.toLocaleString('id-ID')}/bln${stock}`)
      if (rt.description) lines.push(`     ${rt.description}`)
      if (rt.facilities.length > 0) lines.push(`     Fasilitas kamar: ${rt.facilities.join(', ')}`)
    }
  }

  if (kos.facilities.length > 0) lines.push(`Fasilitas umum: ${kos.facilities.join(', ')}`)

  if (kos.nearby.length > 0) {
    lines.push(`Dekat dengan:`)
    for (const n of kos.nearby) lines.push(`   - ${n.name} (${n.distanceText})`)
  }

  return lines.join('\n')
}

export function formatSelfSearchMessage(transactionId: string, kos: KosMessageDetail): string {
  return [
    `Halo! Terima kasih sudah menggunakan FimoStay.`,
    ``,
    `Berikut detail kos yang Anda pilih (ref: ${getReferenceCode(transactionId)}):`,
    ``,
    formatKosBlock(kos),
    ``,
    `Kalau ada pertanyaan lain seputar kos ini, boleh langsung dibalas di chat ini ya.`,
  ].join('\n')
}

export function formatRecommendationMessage(
  transactionId: string,
  preferenceNotes: string | null,
  kosList: KosMessageDetail[]
): string {
  const parts: string[] = [
    `Halo! Terima kasih sudah menggunakan FimoStay.`,
    ``,
    `Berikut ${kosList.length} rekomendasi kos sesuai kriteria Anda (ref: ${getReferenceCode(transactionId)}):`,
  ]
  if (preferenceNotes) parts.push(`Kriteria: ${preferenceNotes}`)
  parts.push(``)

  kosList.forEach((kos, i) => {
    parts.push(formatKosBlock(kos, i + 1))
    parts.push(``)
  })

  parts.push(`Kalau ada yang mau ditanyakan soal salah satu kos di atas, langsung balas di chat ini ya.`)
  return parts.join('\n')
}