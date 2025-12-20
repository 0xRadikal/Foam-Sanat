ALTER TABLE "Ability" ADD COLUMN "minViewRole" "Role";

CREATE INDEX "idx_ability_view_role" ON "Ability"("minViewRole");
