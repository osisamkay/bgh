-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "password" TEXT,
    "role" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "province" TEXT,
    "country" TEXT,
    "termsAccepted" BOOLEAN,
    "phone" TEXT,
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("city", "country", "createdAt", "customerId", "email", "emailVerified", "emailVerifiedAt", "firstName", "id", "lastName", "name", "password", "phone", "postalCode", "province", "role", "streetAddress", "termsAccepted", "updatedAt") SELECT "city", "country", "createdAt", "customerId", "email", "emailVerified", "emailVerifiedAt", "firstName", "id", "lastName", "name", "password", "phone", "postalCode", "province", "role", "streetAddress", "termsAccepted", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_customerId_key" ON "User"("customerId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
