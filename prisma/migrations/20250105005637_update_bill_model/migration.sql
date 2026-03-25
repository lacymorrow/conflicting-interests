-- Add bioguideId to Politician
ALTER TABLE "Politician" ADD COLUMN IF NOT EXISTS "bioguideId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Politician_bioguideId_key" ON "Politician"("bioguideId");

-- Update Bill table
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "sponsorName";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "sponsorParty";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "sponsorState";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "lastAction";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "lastActionDate";
ALTER TABLE "Bill" ALTER COLUMN "summary" DROP NOT NULL;
ALTER TABLE "Bill" ALTER COLUMN "introducedDate" DROP NOT NULL;
ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "sponsorId" TEXT;
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Politician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
