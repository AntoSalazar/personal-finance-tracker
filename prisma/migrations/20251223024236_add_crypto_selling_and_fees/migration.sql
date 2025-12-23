-- CreateEnum
CREATE TYPE "CryptoHoldingStatus" AS ENUM ('ACTIVE', 'SOLD');

-- AlterTable
ALTER TABLE "crypto_holdings" ADD COLUMN     "purchaseFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "saleAccountId" TEXT,
ADD COLUMN     "saleDate" TIMESTAMP(3),
ADD COLUMN     "saleFee" DOUBLE PRECISION,
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "saleTransactionId" TEXT,
ADD COLUMN     "status" "CryptoHoldingStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "crypto_holdings_status_idx" ON "crypto_holdings"("status");
