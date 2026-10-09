-- AlterTable
ALTER TABLE "kos_room_types" ADD COLUMN     "priceMaxMonthly" INTEGER;

-- CreateIndex
CREATE INDEX "audit_logs_kosId_idx" ON "audit_logs"("kosId");

-- CreateIndex
CREATE INDEX "audit_logs_transactionId_idx" ON "audit_logs"("transactionId");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "recommendation_items_kosId_idx" ON "recommendation_items"("kosId");

-- CreateIndex
CREATE INDEX "transactions_searcherId_idx" ON "transactions"("searcherId");

-- CreateIndex
CREATE INDEX "transactions_targetKosId_idx" ON "transactions"("targetKosId");
