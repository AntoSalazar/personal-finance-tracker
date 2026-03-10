-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "accountId" TEXT;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
