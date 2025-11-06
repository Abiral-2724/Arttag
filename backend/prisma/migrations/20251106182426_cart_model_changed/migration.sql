/*
  Warnings:

  - You are about to drop the column `coupenDiscountAmount` on the `CartItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CartItems" DROP COLUMN "coupenDiscountAmount",
ADD COLUMN     "couponDiscountPercentage" INTEGER NOT NULL DEFAULT 0;
