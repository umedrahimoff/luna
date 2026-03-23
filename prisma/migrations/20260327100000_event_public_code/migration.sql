PRAGMA foreign_keys=OFF;

CREATE TABLE "Event_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "format" TEXT NOT NULL,
    "location" TEXT,
    "capacity" INTEGER,
    "coverImageUrl" TEXT,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_new_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_new_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Event_new" (
    "id", "publicCode", "title", "description", "startsAt", "format", "location", "capacity",
    "coverImageUrl", "userId", "categoryId", "createdAt", "updatedAt"
)
SELECT
    "id",
    lower(hex(randomblob(4))),
    "title", "description", "startsAt", "format", "location", "capacity",
    "coverImageUrl", "userId", "categoryId", "createdAt", "updatedAt"
FROM "Event";

DROP TABLE "Event";
ALTER TABLE "Event_new" RENAME TO "Event";

CREATE INDEX "Event_userId_idx" ON "Event"("userId");
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");
CREATE INDEX "Event_categoryId_idx" ON "Event"("categoryId");
CREATE UNIQUE INDEX "Event_publicCode_key" ON "Event"("publicCode");

PRAGMA foreign_keys=ON;
