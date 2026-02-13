/*
  Warnings:

  - Added the required column `storeCity` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeState` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "States" AS ENUM ('AndhraPradesh', 'ArunachalPradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'HimachalPradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'MadhyaPradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'TamilNadu', 'Telangana', 'Tripura', 'UttarPradesh', 'Uttarakhand', 'WestBengal', 'AndamanAndNicobarIslands', 'Chandigarh', 'DadraAndNagarHaveliAndDamanAndDiu', 'Delhi', 'JammuAndKashmir', 'Ladakh', 'Lakshadweep', 'Puducherry');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "storeCity" TEXT NOT NULL,
ADD COLUMN     "storeState" "States" NOT NULL;
