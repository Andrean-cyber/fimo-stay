/*
  Warnings:

  - You are about to drop the column `priceMonthly` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `roomType` on the `kos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kos" DROP COLUMN "priceMonthly",
DROP COLUMN "roomType";

-- CreateTable
CREATE TABLE "kos_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kos_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kos_segments" (
    "id" TEXT NOT NULL,
    "kosId" TEXT NOT NULL,
    "kosTypeId" TEXT NOT NULL,
    "name" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kos_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kos_room_types" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" INTEGER NOT NULL,
    "totalRooms" INTEGER,
    "availableRooms" INTEGER,
    "description" TEXT,
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kos_room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kos_nearby" (
    "id" TEXT NOT NULL,
    "kosId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceText" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kos_nearby_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kos_types_name_key" ON "kos_types"("name");

-- CreateIndex
CREATE INDEX "kos_segments_kosId_idx" ON "kos_segments"("kosId");

-- CreateIndex
CREATE INDEX "kos_segments_kosTypeId_idx" ON "kos_segments"("kosTypeId");

-- CreateIndex
CREATE INDEX "kos_room_types_segmentId_idx" ON "kos_room_types"("segmentId");

-- CreateIndex
CREATE INDEX "kos_room_types_isActive_idx" ON "kos_room_types"("isActive");

-- CreateIndex
CREATE INDEX "kos_nearby_kosId_idx" ON "kos_nearby"("kosId");

-- AddForeignKey
ALTER TABLE "kos_segments" ADD CONSTRAINT "kos_segments_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "kos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kos_segments" ADD CONSTRAINT "kos_segments_kosTypeId_fkey" FOREIGN KEY ("kosTypeId") REFERENCES "kos_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kos_room_types" ADD CONSTRAINT "kos_room_types_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "kos_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kos_nearby" ADD CONSTRAINT "kos_nearby_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "kos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
