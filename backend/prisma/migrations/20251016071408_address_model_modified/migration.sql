/*
  Warnings:

  - Added the required column `email` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "mobile" TEXT NOT NULL,
ALTER COLUMN "pincode" SET DATA TYPE TEXT;
