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
