-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "pickedAt" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3);
