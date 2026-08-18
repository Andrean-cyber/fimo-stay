// Normalisasi nomor HP Indonesia ke format internasional (62xxx),
// lalu bikin link wa.me siap pakai dengan pesan yang sudah di-encode.

export function formatPhoneForWa(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('62')) return digits
    if (digits.startsWith('0')) return `62${digits.slice(1)}`
    return `62${digits}`
  }
  
  export function buildWaLink(phone: string, message: string): string {
    return `https://wa.me/${formatPhoneForWa(phone)}?text=${encodeURIComponent(message)}`
  }