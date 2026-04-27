ALTER TABLE "Proof"
ADD COLUMN IF NOT EXISTS "reviewerName" TEXT,
ADD COLUMN IF NOT EXISTS "reviewerRole" TEXT,
ADD COLUMN IF NOT EXISTS "reviewerEmail" TEXT,
ADD COLUMN IF NOT EXISTS "rating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'manual';

UPDATE "Proof"
SET "reviewerName" = COALESCE("reviewerName", "title"),
    "reviewerRole" = COALESCE("reviewerRole", "metric")
WHERE "reviewerName" IS NULL
   OR "reviewerRole" IS NULL;

CREATE INDEX IF NOT EXISTS "Proof_profileId_isVisible_createdAt_idx"
ON "Proof"("profileId", "isVisible", "createdAt");
