-- AlterTable
ALTER TABLE "EventRegistrationQuestion" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "EventRegistrationQuestion" ADD COLUMN "placeholder" TEXT;
ALTER TABLE "EventRegistrationQuestion" ADD COLUMN "optionsJson" JSON;
