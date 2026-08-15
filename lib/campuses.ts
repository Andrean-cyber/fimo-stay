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
export const KAMPUS_POPULER: { label: string; aliases: string[] }[] = [
    { label: 'UB', aliases: ['UB', 'Universitas Brawijaya', 'Brawijaya'] },
    { label: 'UM', aliases: ['UM', 'Universitas Negeri Malang'] },
    { label: 'UIN Malang', aliases: ['UIN Malang', 'UIN Maulana Malik Ibrahim', 'UIN'] },
    { label: 'UMM', aliases: ['UMM', 'Universitas Muhammadiyah Malang'] },
    { label: 'Polinema', aliases: ['Polinema', 'Politeknik Negeri Malang'] },
    { label: 'Unikama', aliases: ['Unikama', 'Universitas Kanjuruhan Malang'] },
  ]
  