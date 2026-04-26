-- CreateTable
CREATE TABLE "VocationalTestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "methodVersion" TEXT NOT NULL DEFAULT 'vocational-v1',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "profile" JSONB NOT NULL DEFAULT '{}',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "result" JSONB,
    "aiReport" TEXT,
    "reportProvider" TEXT,
    "reportModel" TEXT,
    "reportGeneratedAt" TIMESTAMP(3),
    "publicInPortfolio" BOOLEAN NOT NULL DEFAULT false,
    "publicInResume" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocationalTestSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VocationalTestSession_userId_updatedAt_idx" ON "VocationalTestSession"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "VocationalTestSession_userId_status_idx" ON "VocationalTestSession"("userId", "status");

-- AddForeignKey
ALTER TABLE "VocationalTestSession" ADD CONSTRAINT "VocationalTestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
