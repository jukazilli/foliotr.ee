CREATE TABLE IF NOT EXISTS "VersionEducation" (
  "versionId" TEXT NOT NULL,
  "educationId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "VersionEducation_pkey" PRIMARY KEY ("versionId", "educationId")
);

CREATE INDEX IF NOT EXISTS "VersionEducation_versionId_order_idx"
  ON "VersionEducation"("versionId", "order");

ALTER TABLE "VersionEducation"
  ADD CONSTRAINT "VersionEducation_versionId_fkey"
  FOREIGN KEY ("versionId") REFERENCES "Version"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VersionEducation"
  ADD CONSTRAINT "VersionEducation_educationId_fkey"
  FOREIGN KEY ("educationId") REFERENCES "Education"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
