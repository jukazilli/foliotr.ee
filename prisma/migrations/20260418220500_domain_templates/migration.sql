DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PublishState') THEN
    CREATE TYPE "PublishState" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssetKind') THEN
    CREATE TYPE "AssetKind" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssetStatus') THEN
    CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'READY', 'FAILED');
  END IF;
END $$;

ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "kind" "AssetKind" NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "status" "AssetStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "altText" TEXT;
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "height" INTEGER;
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS "Asset_storageKey_key" ON "Asset"("storageKey");

ALTER TABLE "Experience" ADD COLUMN IF NOT EXISTS "logoAssetId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "coverAssetId" TEXT;
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "assetId" TEXT;
ALTER TABLE "Proof" ADD COLUMN IF NOT EXISTS "assetId" TEXT;

CREATE TABLE IF NOT EXISTS "Highlight" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "metric" TEXT,
  "assetId" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "sourceNodeId" TEXT;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "theme" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "key" TEXT;
UPDATE "TemplateBlockDef" SET "key" = "blockType" WHERE "key" IS NULL;
ALTER TABLE "TemplateBlockDef" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "label" TEXT;
UPDATE "TemplateBlockDef" SET "label" = "blockType" WHERE "label" IS NULL;
ALTER TABLE "TemplateBlockDef" ALTER COLUMN "label" SET NOT NULL;
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'section';
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "defaultProps" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "editableFields" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "assetFields" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "TemplateBlockDef" ADD COLUMN IF NOT EXISTS "allowedChildren" JSONB NOT NULL DEFAULT '[]';
DROP INDEX IF EXISTS "TemplateBlockDef_templateId_blockType_key";
CREATE UNIQUE INDEX IF NOT EXISTS "TemplateBlockDef_templateId_key_key" ON "TemplateBlockDef"("templateId", "key");
CREATE INDEX IF NOT EXISTS "TemplateBlockDef_templateId_blockType_idx" ON "TemplateBlockDef"("templateId", "blockType");

ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "publishState" "PublishState" NOT NULL DEFAULT 'DRAFT';
UPDATE "Page" SET "publishState" = CASE WHEN "published" THEN 'PUBLISHED'::"PublishState" ELSE 'DRAFT'::"PublishState" END;
CREATE UNIQUE INDEX IF NOT EXISTS "Page_versionId_key" ON "Page"("versionId");

ALTER TABLE "PageBlock" ADD COLUMN IF NOT EXISTS "templateBlockDefId" TEXT;
ALTER TABLE "PageBlock" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "PageBlock" ADD COLUMN IF NOT EXISTS "key" TEXT;
UPDATE "PageBlock" SET "key" = "blockType" || '-' || "id" WHERE "key" IS NULL;
ALTER TABLE "PageBlock" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "PageBlock" ADD COLUMN IF NOT EXISTS "props" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "PageBlock" ADD COLUMN IF NOT EXISTS "assets" JSONB NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS "PageBlock_pageId_parentId_order_idx" ON "PageBlock"("pageId", "parentId", "order");
CREATE INDEX IF NOT EXISTS "PageBlock_templateBlockDefId_idx" ON "PageBlock"("templateBlockDefId");

ALTER TABLE "ResumeConfig" ADD COLUMN IF NOT EXISTS "publishState" "PublishState" NOT NULL DEFAULT 'DRAFT';
UPDATE "ResumeConfig" SET "publishState" = CASE WHEN "published" THEN 'PUBLISHED'::"PublishState" ELSE 'DRAFT'::"PublishState" END;
UPDATE "ResumeConfig" SET "sections" = ARRAY[]::TEXT[] WHERE "sections" IS NULL;
ALTER TABLE "ResumeConfig" ALTER COLUMN "sections" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ResumeConfig" ALTER COLUMN "sections" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "VersionExperience" (
  "versionId" TEXT NOT NULL,
  "experienceId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionExperience_pkey" PRIMARY KEY ("versionId", "experienceId")
);
CREATE TABLE IF NOT EXISTS "VersionProject" (
  "versionId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionProject_pkey" PRIMARY KEY ("versionId", "projectId")
);
CREATE TABLE IF NOT EXISTS "VersionSkill" (
  "versionId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionSkill_pkey" PRIMARY KEY ("versionId", "skillId")
);
CREATE TABLE IF NOT EXISTS "VersionAchievement" (
  "versionId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionAchievement_pkey" PRIMARY KEY ("versionId", "achievementId")
);
CREATE TABLE IF NOT EXISTS "VersionProof" (
  "versionId" TEXT NOT NULL,
  "proofId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionProof_pkey" PRIMARY KEY ("versionId", "proofId")
);
CREATE TABLE IF NOT EXISTS "VersionHighlight" (
  "versionId" TEXT NOT NULL,
  "highlightId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionHighlight_pkey" PRIMARY KEY ("versionId", "highlightId")
);
CREATE TABLE IF NOT EXISTS "VersionLink" (
  "versionId" TEXT NOT NULL,
  "linkId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VersionLink_pkey" PRIMARY KEY ("versionId", "linkId")
);

INSERT INTO "VersionExperience" ("versionId", "experienceId", "order")
SELECT v."id", e."experienceId", e."ord" - 1
FROM "Version" v, unnest(coalesce(v."selectedExperienceIds", ARRAY[]::TEXT[])) WITH ORDINALITY AS e("experienceId", "ord")
ON CONFLICT DO NOTHING;
INSERT INTO "VersionProject" ("versionId", "projectId", "order")
SELECT v."id", p."projectId", p."ord" - 1
FROM "Version" v, unnest(coalesce(v."selectedProjectIds", ARRAY[]::TEXT[])) WITH ORDINALITY AS p("projectId", "ord")
ON CONFLICT DO NOTHING;
INSERT INTO "VersionSkill" ("versionId", "skillId", "order")
SELECT v."id", s."skillId", s."ord" - 1
FROM "Version" v, unnest(coalesce(v."selectedSkillIds", ARRAY[]::TEXT[])) WITH ORDINALITY AS s("skillId", "ord")
ON CONFLICT DO NOTHING;
INSERT INTO "VersionAchievement" ("versionId", "achievementId", "order")
SELECT v."id", a."achievementId", a."ord" - 1
FROM "Version" v, unnest(coalesce(v."selectedAchievementIds", ARRAY[]::TEXT[])) WITH ORDINALITY AS a("achievementId", "ord")
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS "VersionExperience_versionId_order_idx" ON "VersionExperience"("versionId", "order");
CREATE INDEX IF NOT EXISTS "VersionProject_versionId_order_idx" ON "VersionProject"("versionId", "order");
CREATE INDEX IF NOT EXISTS "VersionSkill_versionId_order_idx" ON "VersionSkill"("versionId", "order");
CREATE INDEX IF NOT EXISTS "VersionAchievement_versionId_order_idx" ON "VersionAchievement"("versionId", "order");
CREATE INDEX IF NOT EXISTS "VersionProof_versionId_order_idx" ON "VersionProof"("versionId", "order");
CREATE INDEX IF NOT EXISTS "VersionHighlight_versionId_order_idx" ON "VersionHighlight"("versionId", "order");
CREATE INDEX IF NOT EXISTS "VersionLink_versionId_order_idx" ON "VersionLink"("versionId", "order");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Experience_logoAssetId_fkey') THEN
    ALTER TABLE "Experience" ADD CONSTRAINT "Experience_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_coverAssetId_fkey') THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Achievement_assetId_fkey') THEN
    ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Proof_assetId_fkey') THEN
    ALTER TABLE "Proof" ADD CONSTRAINT "Proof_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Highlight_profileId_fkey') THEN
    ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Highlight_assetId_fkey') THEN
    ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PageBlock_templateBlockDefId_fkey') THEN
    ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_templateBlockDefId_fkey" FOREIGN KEY ("templateBlockDefId") REFERENCES "TemplateBlockDef"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PageBlock_parentId_fkey') THEN
    ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PageBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
