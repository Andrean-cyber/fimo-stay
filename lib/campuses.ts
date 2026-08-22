// Daftar kampus populer di Malang, dipakai di homepage (tombol "Dekat Kampus
// Populer") dan halaman /kos (filter berdasarkan KosNearby).
//
// ⚠️ Belum ada tabel master kampus di database (lihat catatan di
// schema.prisma pada model KosNearby) — nama tempat diinput bebas oleh admin
// per kos (mis. "UB", "Unikama", "Universitas Brawijaya"). Supaya klik
// "UB" tetap ketemu kos yang nearby-nya ditulis "Universitas Brawijaya" atau
// sebaliknya, tiap kampus punya beberapa alias yang dicocokkan sekaligus
// (bukan exact match satu string).
//
// ✏️ Sesuaikan/lengkapi daftar & alias ini sesuai kampus yang paling sering
// dipakai tim admin saat input nearby, supaya matching-nya makin akurat.
//
// 🖼️ logoUrl opsional — path lokal ke file di /public (mis. "/logos/ub.png").
// Sengaja TIDAK hotlink ke URL logo dari internet (rawan putus & isu hak
// cipta). Kalau logoUrl kosong/undefined, otomatis fallback ke icon generik
// GraduationCap di UI. Taruh file logo (PNG/SVG, disarankan persegi,
// background transparan) di public/logos/ lalu isi path-nya di sini.
export const KAMPUS_POPULER: { label: string; aliases: string[]; logoUrl?: string }[] = [
  { label: 'UB', aliases: ['UB', 'Universitas Brawijaya', 'Brawijaya'], logoUrl: 'kampus/ub.webp' },
  { label: 'ITS', aliases: ['ITS', 'Institut Teknologi Sepuluh Nopember'], logoUrl: 'kampus/its.webp' },
  { label: 'ITB', aliases: ['ITB', 'Institut Teknologi Bandung'], logoUrl: 'kampus/itb.webp' },
  { label: 'UGM', aliases: ['UGM', 'Universitas Gadjah Mada'], logoUrl: 'kampus/ugm.webp' },
  { label: 'UI', aliases: ['UI', 'Universitas Indonesia'], logoUrl: 'kampus/ui.webp' },
  { label: 'Undip', aliases: ['Undip', 'Universitas Diponegoro'], logoUrl: 'kampus/undip.webp' },
]
