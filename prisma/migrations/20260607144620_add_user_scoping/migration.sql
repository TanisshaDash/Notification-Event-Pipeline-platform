/*
  Warnings:

  - A unique constraint covering the columns `[eventType,channel,userId]` on the table `NotificationTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `NotificationTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "NotificationTemplate_eventType_channel_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NotificationTemplate" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_eventType_channel_userId_key" ON "NotificationTemplate"("eventType", "channel", "userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
