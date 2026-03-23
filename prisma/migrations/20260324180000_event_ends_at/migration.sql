-- AlterTable
ALTER TABLE "Event" ADD COLUMN "endsAt" DATETIME;
UPDATE "Event" SET "endsAt" = "startsAt" WHERE "endsAt" IS NULL;
