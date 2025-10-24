-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" TEXT;
