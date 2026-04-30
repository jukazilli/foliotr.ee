CREATE TYPE "UserRole" AS ENUM ('USER', 'DEVELOPER');

CREATE TYPE "FeedbackKind" AS ENUM ('IMPROVEMENT', 'CORRECTION');

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

CREATE TABLE "FeedbackTicket" (
  "id" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "kind" "FeedbackKind" NOT NULL,
  "message" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "x" INTEGER NOT NULL,
  "y" INTEGER NOT NULL,
  "relativeX" DOUBLE PRECISION NOT NULL,
  "relativeY" DOUBLE PRECISION NOT NULL,
  "viewportWidth" INTEGER NOT NULL,
  "viewportHeight" INTEGER NOT NULL,
  "elementTag" TEXT,
  "elementId" TEXT,
  "elementClasses" TEXT,
  "elementText" TEXT,
  "reporterUserId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FeedbackTicket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FeedbackTicket_number_key" ON "FeedbackTicket"("number");
CREATE INDEX "FeedbackTicket_route_createdAt_idx" ON "FeedbackTicket"("route", "createdAt");
CREATE INDEX "FeedbackTicket_reporterUserId_createdAt_idx" ON "FeedbackTicket"("reporterUserId", "createdAt");
CREATE INDEX "FeedbackTicket_status_createdAt_idx" ON "FeedbackTicket"("status", "createdAt");

ALTER TABLE "FeedbackTicket"
ADD CONSTRAINT "FeedbackTicket_reporterUserId_fkey"
FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
