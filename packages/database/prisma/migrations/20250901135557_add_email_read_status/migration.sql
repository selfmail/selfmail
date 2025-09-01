-- AlterTable
ALTER TABLE "public"."Email" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Email_read_idx" ON "public"."Email"("read");
