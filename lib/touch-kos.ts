import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Bump Kos.lastUpdatedAt + updatedById setiap kali admin menyentuh
 * data turunan kos (segment, room type, nearby). Dipakai supaya cron
 * auto-hide 7 hari tetap akurat walau harga/kamar diupdate tiap hari
 * tanpa pernah menyentuh field Kos langsung.
 *
 * PENTING: selalu panggil ini di dalam transaction yang sama dengan
 * operasi utamanya (lihat contoh actions di bawah), supaya atomic —
 * kalau salah satu gagal, keduanya rollback.
 */
export async function touchKos(
  tx: Prisma.TransactionClient | PrismaClient,
  kosId: string,
  adminId: string
) {
  await tx.kos.update({
    where: { id: kosId },
    data: {
      lastUpdatedAt: new Date(),
      updatedById: adminId,
      // status kadang perlu direset ke ACTIVE kalau sebelumnya HIDDEN_STALE
      // dan admin baru saja update — uncomment kalau perilaku ini diinginkan:
      // status: "ACTIVE",
    },
  });
}
