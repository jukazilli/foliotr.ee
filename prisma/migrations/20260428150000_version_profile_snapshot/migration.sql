ALTER TABLE "Version"
ADD COLUMN "profileSnapshot" JSONB NOT NULL DEFAULT '{}';
