-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "metadata" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maxBookingsPerUser" INTEGER NOT NULL DEFAULT 5,
    "cancellationPolicy" TEXT NOT NULL DEFAULT '24 hours',
    "checkInTime" TEXT NOT NULL DEFAULT '14:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Setting" ("cancellationPolicy", "checkInTime", "checkOutTime", "createdAt", "emailNotifications", "id", "maintenanceMode", "maxBookingsPerUser", "updatedAt") SELECT "cancellationPolicy", "checkInTime", "checkOutTime", "createdAt", "emailNotifications", "id", "maintenanceMode", "maxBookingsPerUser", "updatedAt" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
