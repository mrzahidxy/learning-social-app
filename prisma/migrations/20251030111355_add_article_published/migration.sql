-- AlterTable
ALTER TABLE "public"."Article" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Article_published_idx" ON "public"."Article"("published");
