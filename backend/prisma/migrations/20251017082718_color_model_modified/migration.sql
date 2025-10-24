/*
  Warnings:

  - You are about to drop the column `colorId` on the `ProductImages` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ProductImages` table. All the data in the column will be lost.
  - Added the required column `primaryImage1` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryImage2` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorImage1` to the `ProductColor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorImage2` to the `ProductColor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductImages" DROP CONSTRAINT "ProductImages_colorId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "primaryImage1" TEXT NOT NULL,
ADD COLUMN     "primaryImage2" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductColor" ADD COLUMN     "colorImage1" TEXT NOT NULL,
ADD COLUMN     "colorImage2" TEXT NOT NULL,
ADD COLUMN     "colorImage3" TEXT,
ADD COLUMN     "colorImage4" TEXT,
ADD COLUMN     "colorImage5" TEXT;

-- AlterTable
ALTER TABLE "ProductImages" DROP COLUMN "colorId",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "public"."ImageType";
