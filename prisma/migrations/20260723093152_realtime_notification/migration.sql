/*
  Warnings:

  - A unique constraint covering the columns `[userId,articleId,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ARTICLE_PUBLISHED');

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "type" "public"."NotificationType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_articleId_type_key" ON "public"."Notification"("userId", "articleId", "type");

-- CreateIndex
CREATE INDEX "Subscription_authorUserId_idx" ON "public"."Subscription"("authorUserId");

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
