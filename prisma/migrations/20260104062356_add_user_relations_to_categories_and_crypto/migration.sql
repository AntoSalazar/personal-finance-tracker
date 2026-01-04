/*
  Warnings:

  - Added the required column `userId` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- SECURITY FIX: Assign existing categories to the first user (main account)
-- First, add the column as nullable
ALTER TABLE "categories" ADD COLUMN "userId" TEXT;

-- Update all existing categories to belong to the first user
UPDATE "categories" SET "userId" = (SELECT id FROM "user" LIMIT 1) WHERE "userId" IS NULL;

-- Now make the column required
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_holdings" ADD CONSTRAINT "crypto_holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
