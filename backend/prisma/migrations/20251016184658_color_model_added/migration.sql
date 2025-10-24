/*
  Warnings:

  - Added the required column `colorId` to the `ProductImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImages" ADD COLUMN     "colorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImages" ADD CONSTRAINT "ProductImages_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
