-- AlterTable
ALTER TABLE "crypto_holdings" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE INDEX "crypto_holdings_accountId_idx" ON "crypto_holdings"("accountId");
