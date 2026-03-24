-- AlterTable
ALTER TABLE "User" ADD COLUMN "telegramUserId" TEXT;
ALTER TABLE "User" ADD COLUMN "loginSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUserId_key" ON "User"("telegramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_loginSlug_key" ON "User"("loginSlug");

-- CreateTable
CREATE TABLE "TelegramAuthCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "userId" INTEGER,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelegramAuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAuthCode_code_key" ON "TelegramAuthCode"("code");

-- CreateIndex
CREATE INDEX "TelegramAuthCode_telegramUserId_idx" ON "TelegramAuthCode"("telegramUserId");

-- CreateIndex
CREATE INDEX "TelegramAuthCode_code_idx" ON "TelegramAuthCode"("code");
