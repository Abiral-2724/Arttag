/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Category_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description",
DROP COLUMN "slug";
