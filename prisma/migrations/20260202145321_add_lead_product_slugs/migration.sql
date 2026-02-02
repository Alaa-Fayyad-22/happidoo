-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "productSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
