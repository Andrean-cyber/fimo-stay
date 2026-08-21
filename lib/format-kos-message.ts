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

const SEPARATOR = '----------'

// WhatsApp cuma kenal format ini: *bold*, _italic_, ~strikethrough~.
// Tidak ada heading (##), tidak ada bold+italic gabungan (***x***) — jangan dipakai.
// JANGAN pakai emoji: pipeline pengiriman saat ini merusaknya jadi karakter "�".
function formatKosBlock(kos: KosMessageDetail, index?: number): string {
  const blocks: string[] = []

  const title = index ? `*${index}. ${kos.name}*` : `*${kos.name}*`
  blocks.push(kos.description ? `${title}\n_${kos.description}_` : title)

  const districtPart = kos.district ? `${kos.district}, ` : ''
  blocks.push(`Alamat: ${kos.address}, ${districtPart}${kos.city}\nKontak pemilik: ${kos.ownerName} - ${kos.ownerPhone}`)

  for (const seg of kos.segments) {
    const segLabel = seg.name ? `${seg.kosTypeName} - ${seg.name}` : seg.kosTypeName
    const segLines: string[] = [`*Tipe Kamar (${segLabel})*`]
    for (const rt of seg.roomTypes) {
      const stock = rt.availableRooms != null ? ` _(sisa ${rt.availableRooms} kamar)_` : ''
      segLines.push(`- *${rt.name}* - Rp${rt.priceMonthly.toLocaleString('id-ID')}/bln${stock}`)
      if (rt.description) segLines.push(`   ${rt.description}`)
      if (rt.facilities.length > 0) segLines.push(`   Fasilitas kamar: ${rt.facilities.join(', ')}`)
    }
    blocks.push(segLines.join('\n'))
  }

  if (kos.facilities.length > 0) {
    blocks.push(`*Fasilitas Umum*\n${kos.facilities.join(', ')}`)
  }

  if (kos.nearby.length > 0) {
    const nearbyLines = [`*Dekat dengan*`, ...kos.nearby.map((n) => `- ${n.name} _(${n.distanceText})_`)]
    blocks.push(nearbyLines.join('\n'))
  }

  // Antar section dalam 1 kos dipisah 1 baris kosong (\n\n) supaya gak numpuk jadi satu blok teks.
  return blocks.join('\n\n')
}

export function formatSelfSearchMessage(transactionId: string, kos: KosMessageDetail): string {
  return [
    `Halo! Terima kasih sudah menggunakan *FimoStay*.`,
    ``,
    `Berikut detail kos yang Anda pilih (ref: *${getReferenceCode(transactionId)}*):`,
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
    `Halo! Terima kasih sudah menggunakan *FimoStay*.`,
    ``,
    `Berikut *${kosList.length} rekomendasi kos* sesuai kriteria Anda (ref: *${getReferenceCode(transactionId)}*):`,
  ]
  if (preferenceNotes) parts.push(`_Kriteria: ${preferenceNotes}_`)
  parts.push(``)

  kosList.forEach((kos, i) => {
    parts.push(formatKosBlock(kos, i + 1))
    // Pemisah antar kos supaya jelas batas satu kos ke kos berikutnya, kecuali setelah kos terakhir.
    if (i < kosList.length - 1) {
      parts.push(``)
      parts.push(SEPARATOR)
    }
    parts.push(``)
  })

  parts.push(`Kalau ada yang mau ditanyakan soal salah satu kos di atas, langsung balas di chat ini ya.`)
  return parts.join('\n')
}
