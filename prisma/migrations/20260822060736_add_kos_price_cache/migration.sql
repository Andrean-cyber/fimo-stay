-- AlterTable
ALTER TABLE "kos" ADD COLUMN     "priceMaxCache" INTEGER,
ADD COLUMN     "priceMinCache" INTEGER;

-- CreateIndex
CREATE INDEX "kos_priceMinCache_idx" ON "kos"("priceMinCache");

-- CreateIndex
CREATE INDEX "kos_priceMaxCache_idx" ON "kos"("priceMaxCache");

-- CreateIndex
CREATE INDEX "kos_status_priceMinCache_priceMaxCache_idx" ON "kos"("status", "priceMinCache", "priceMaxCache");
