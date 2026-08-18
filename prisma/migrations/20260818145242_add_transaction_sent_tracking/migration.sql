-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "sentById" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "admin_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
