-- AlterTable
ALTER TABLE "Ability" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_ability_deleted" ON "Ability"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_ability_privacy" ON "Ability"("isPrivate");

