// Mapping nama kota -> gambar lokal di /public/cities.
//
// ⚠️ Sama seperti KAMPUS_POPULER, kota disimpan sebagai teks bebas oleh
// admin per kos (lihat Kos.city di schema.prisma), jadi TIDAK ada tabel
// master kota. Mapping ini murni untuk tampilan kartu "Lokasi Populer" di
// homepage — key harus persis nama kota yang paling sering diinput admin
// (dicocokkan case-insensitive, lihat penggunaannya di homepage).
//
// 🖼️ Taruh file gambar (JPG/WebP, disarankan rasio persegi/1:1, resolusi
// cukup ~600x600) di public/cities/ lalu daftarkan path-nya di sini.
// Kalau ada kota populer yang tidak terdaftar di sini, homepage otomatis
// fallback ke kotak icon MapPin generik — jadi aman ditambah bertahap.
//
// ✏️ Tambah/lengkapi sesuai kota yang paling sering muncul di Kos.city.
export const CITY_IMAGES: Record<string, string> = {
  malang: 'kota/malang.webp',
  surabaya: 'kota/surabaya.webp',
  jakarta: 'kota/jakarta.webp',
  bali: 'kota/bali.webp',
  jogja: 'kota/jogja.webp',
  bandung: 'kota/bandung.webp',
  batam: 'kota/batam.webp',
  bogor: 'kota/bogor.webp',
  medan: 'kota/medan.webp',
  semarang: 'kota/semarang.webp',
}

export function getCityImage(city: string): string | undefined {
  return CITY_IMAGES[city.trim().toLowerCase()]
}
