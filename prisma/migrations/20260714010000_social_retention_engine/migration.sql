-- Migration: social_retention_engine
-- Adds streak tracking, runner levels, RunnerOfTheWeek, bio, and performance indexes

-- Create RunnerLevel enum
DO $$ BEGIN
  CREATE TYPE "RunnerLevel" AS ENUM ('BEGINNER', 'RUNNER', 'ATHLETE', 'ELITE', 'LEGEND');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add streak fields, level, and bio to User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastCheckInDate" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "level" "RunnerLevel" NOT NULL DEFAULT 'BEGINNER',
  ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Performance index for streak calculation (userId + checkedInAt)
CREATE INDEX IF NOT EXISTS "CheckIn_userId_checkedInAt_idx" ON "CheckIn" ("userId", "checkedInAt" DESC);

-- Runner of the Week model
CREATE TABLE IF NOT EXISTS "RunnerOfTheWeek" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "weekStart" TIMESTAMPTZ NOT NULL,
  "weekEnd" TIMESTAMPTZ NOT NULL,
  "totalKm" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RunnerOfTheWeek_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RunnerOfTheWeek_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
  CONSTRAINT "RunnerOfTheWeek_tenantId_weekStart_key" UNIQUE ("tenantId", "weekStart")
);

CREATE INDEX IF NOT EXISTS "RunnerOfTheWeek_tenantId_createdAt_idx" ON "RunnerOfTheWeek" ("tenantId", "createdAt" DESC);
