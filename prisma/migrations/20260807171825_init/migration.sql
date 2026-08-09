/*
  Warnings:

  - You are about to drop the `Inquiry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Property` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PropertyPhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "KosStatus" AS ENUM ('ACTIVE', 'HIDDEN_STALE', 'HIDDEN_MANUAL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SELF_SEARCH', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_pencariId_fkey";

-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_inputById_fkey";

-- DropForeignKey
ALTER TABLE "PropertyPhoto" DROP CONSTRAINT "PropertyPhoto_propertyId_fkey";

-- DropTable
DROP TABLE "Inquiry";

-- DropTable
DROP TABLE "Property";

-- DropTable
DROP TABLE "PropertyPhoto";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "InquiryStatus";

-- DropEnum
DROP TYPE "InquiryType";

-- DropEnum
DROP TYPE "PropertyStatus";

-- DropEnum
DROP TYPE "PropertyType";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "priceMonthly" INTEGER NOT NULL,
    "roomType" TEXT,
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "KosStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kos_media" (
    "id" TEXT NOT NULL,
    "kosId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kos_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "searchers" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "searchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "proofUrl" TEXT NOT NULL,
    "searcherId" TEXT NOT NULL,
    "targetKosId" TEXT,
    "preferenceNotes" TEXT,
    "recommendationToken" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "kosId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "kosId" TEXT,
    "transactionId" TEXT,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_email_key" ON "admin_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kos_slug_key" ON "kos"("slug");

-- CreateIndex
CREATE INDEX "kos_status_idx" ON "kos"("status");

-- CreateIndex
CREATE INDEX "kos_city_idx" ON "kos"("city");

-- CreateIndex
CREATE INDEX "kos_lastUpdatedAt_idx" ON "kos"("lastUpdatedAt");

-- CreateIndex
CREATE INDEX "kos_media_kosId_idx" ON "kos_media"("kosId");

-- CreateIndex
CREATE INDEX "searchers_phone_idx" ON "searchers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_recommendationToken_key" ON "transactions"("recommendationToken");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_items_transactionId_kosId_key" ON "recommendation_items"("transactionId", "kosId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "kos" ADD CONSTRAINT "kos_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kos" ADD CONSTRAINT "kos_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "admin_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kos_media" ADD CONSTRAINT "kos_media_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "kos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_searcherId_fkey" FOREIGN KEY ("searcherId") REFERENCES "searchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_targetKosId_fkey" FOREIGN KEY ("targetKosId") REFERENCES "kos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "admin_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_items" ADD CONSTRAINT "recommendation_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_items" ADD CONSTRAINT "recommendation_items_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "kos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "kos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
