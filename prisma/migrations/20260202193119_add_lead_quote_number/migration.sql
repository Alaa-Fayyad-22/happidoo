/*
  Warnings:

  - A unique constraint covering the columns `[quoteNo]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "quoteNo" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_quoteNo_key" ON "Lead"("quoteNo");
