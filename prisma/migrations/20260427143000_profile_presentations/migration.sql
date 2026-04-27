CREATE TABLE IF NOT EXISTS "ProfilePresentation" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "context" TEXT,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProfilePresentation_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "ProfilePresentation"
  ADD CONSTRAINT "ProfilePresentation_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "ProfilePresentation_profileId_order_idx"
ON "ProfilePresentation"("profileId", "order");

ALTER TABLE "Profile"
ADD COLUMN IF NOT EXISTS "defaultPresentationId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Profile"
  ADD CONSTRAINT "Profile_defaultPresentationId_fkey"
  FOREIGN KEY ("defaultPresentationId") REFERENCES "ProfilePresentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Version"
ADD COLUMN IF NOT EXISTS "presentationId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Version"
  ADD CONSTRAINT "Version_presentationId_fkey"
  FOREIGN KEY ("presentationId") REFERENCES "ProfilePresentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
