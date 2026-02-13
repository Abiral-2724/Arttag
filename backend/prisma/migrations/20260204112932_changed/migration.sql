/*
  Warnings:

  - The values [Thusday] on the enum `WeekDays` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WeekDays_new" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
ALTER TABLE "Store" ALTER COLUMN "storeOpenDayStart" TYPE "WeekDays_new" USING ("storeOpenDayStart"::text::"WeekDays_new");
ALTER TABLE "Store" ALTER COLUMN "storeOpenDayEnd" TYPE "WeekDays_new" USING ("storeOpenDayEnd"::text::"WeekDays_new");
ALTER TYPE "WeekDays" RENAME TO "WeekDays_old";
ALTER TYPE "WeekDays_new" RENAME TO "WeekDays";
DROP TYPE "public"."WeekDays_old";
COMMIT;
