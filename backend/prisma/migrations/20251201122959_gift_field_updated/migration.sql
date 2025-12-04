-- AlterTable
ALTER TABLE "CartItems" ADD COLUMN     "giftMessageFromSender" TEXT NOT NULL DEFAULT 'None',
ADD COLUMN     "giftRecipentname" TEXT NOT NULL DEFAULT 'None',
ADD COLUMN     "giftSendername" TEXT NOT NULL DEFAULT 'None';
