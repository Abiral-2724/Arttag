-- CreateEnum
CREATE TYPE "WeekDays" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thusday', 'Friday', 'Saturday', 'Sunday');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeAddress" TEXT NOT NULL,
    "storePincode" INTEGER NOT NULL,
    "storeImage" TEXT,
    "storePhoneNumber" TEXT NOT NULL,
    "storeOpenDayStart" "WeekDays" NOT NULL,
    "storeOpenDayEnd" "WeekDays" NOT NULL,
    "storeOpeningTimeing" TEXT,
    "storeClosingTiming" TEXT,
    "is24x7" BOOLEAN NOT NULL DEFAULT false,
    "storeLocationUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);
