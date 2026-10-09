// 900000 -> "900rb", 1200000 -> "1,2jt", 1250000 -> "1,25jt"
export function formatRpShort(n: number) {
    if (n >= 1_000_000) {
      const v = n / 1_000_000
      const s = Number.isInteger(v) ? String(v) : String(parseFloat(v.toFixed(2))).replace('.', ',')
      return `${s}jt`
    }
    // kelipatan seribu jadi "rb"; selain itu tampil lengkap supaya tidak salah bulat
    if (n >= 1000 && n % 1000 === 0) return `${n / 1000}rb`
    return n.toLocaleString('id-ID')
  }