-- AlterTable
ALTER TABLE "User" ADD COLUMN "telegramUserId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUserId_key" ON "User"("telegramUserId");

-- CreateTable
CREATE TABLE "TelegramAuthCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "telegramUserId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAuthCode_code_key" ON "TelegramAuthCode"("code");

-- CreateIndex
CREATE INDEX "TelegramAuthCode_code_idx" ON "TelegramAuthCode"("code");

-- CreateIndex
CREATE INDEX "TelegramAuthCode_telegramUserId_idx" ON "TelegramAuthCode"("telegramUserId");
