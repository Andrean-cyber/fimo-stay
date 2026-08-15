export const FACILITIES = [
  'AC', 'WiFi', 'Kamar Mandi Dalam', 'Kamar Mandi Luar', 'Dispenser', 'Kulkas',
  'Dapur Bersama', 'Parkir Motor', 'Parkir Mobil', 'Jemuran', 'CCTV', 'Security 24 Jam',
]

export const ROOM_FACILITIES = [
  'AC', 'Kasur', 'Lemari', 'Meja Belajar', 'Kamar Mandi Dalam',
]

export const WHATSAPP_NUMBER = '628993503094' // GANTI dengan nomor WA official FimoStay, format 62xxx tanpa +

// Jumlah kos yang harus dipilihkan admin untuk transaksi tipe RECOMMENDATION.
// Satu-satunya tempat yang perlu diubah kalau angkanya berubah di masa depan.
export const RECOMMENDATION_KOS_COUNT = 3

export function getReferenceCode(transactionId: string) {
  return transactionId.split('-')[0].toUpperCase() // 8 karakter pertama UUID
}

export function buildWhatsAppLink(transactionId: string, label: string, amount: number) {
  const code = getReferenceCode(transactionId)
  const message = `Halo FimoStay, saya sudah transfer Rp${amount.toLocaleString('id-ID')} untuk "${label}". Kode referensi: ${code}. Berikut bukti transfernya.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const PAYMENT_INFO = {
  bank: 'BCA',
  accountNumber: '1234567890',
  accountName: 'FimoStay',
}

export function buildOwnerWhatsAppLink(phone: string, kosName: string) {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '62')
  const message = encodeURIComponent(
    `Halo, saya dapat kontak Anda dari FimoStay. Saya tertarik dengan ${kosName}, apakah masih tersedia?`
  )
  return `https://wa.me/${normalized}?text=${message}`
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits
}


export function buildKosInfoWhatsAppLink(params: {
  phone: string
  kosName: string
  priceText: string
  ownerName: string
  ownerPhone: string
}) {
  const message = `Halo, terima kasih sudah menggunakan FimoStay!\n\nBerikut kos yang kamu pilih:\n\n🏠 ${params.kosName}\n💰 ${params.priceText}\n\nKontak owner:\n${params.ownerName} — ${params.ownerPhone}\n\nSilakan hubungi langsung untuk survey/booking. Semoga cocok!`
  return `https://wa.me/${params.phone}?text=${encodeURIComponent(message)}`
}

export function buildRekomendasiWhatsAppLink(phone: string, token: string) {
  const message = `Halo, rekomendasi 3 kos dari tim FimoStay sudah siap!\n\nLihat di sini: ${process.env.NEXT_PUBLIC_SITE_URL}/rekomendasi/${token}\n\nKalau ada pertanyaan, langsung balas chat ini ya.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function normalizeCityName(city: string) {
  return city.trim().replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}