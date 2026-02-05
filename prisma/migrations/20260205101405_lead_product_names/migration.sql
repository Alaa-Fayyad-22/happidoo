-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "productNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
