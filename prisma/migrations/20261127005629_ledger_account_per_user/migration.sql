/*
  Warnings:

  - A unique constraint covering the columns `[code,userId]` on the table `LedgerAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LedgerAccount_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccount_code_userId_key" ON "LedgerAccount"("code", "userId");
