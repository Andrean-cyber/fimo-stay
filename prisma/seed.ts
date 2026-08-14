import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const kosTypes = ["Putra", "Putri", "Campur", "Putra & Putri", "LV", "Pasutri"];

  await prisma.kosType.createMany({
    data: kosTypes.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Seed selesai:", kosTypes.length, "kos types dibuat");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
