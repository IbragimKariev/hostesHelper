-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "waiterId" TEXT;

-- CreateTable
CREATE TABLE "waiters" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthYear" INTEGER,
    "languages" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waiters_isActive_idx" ON "waiters"("isActive");

-- CreateIndex
CREATE INDEX "reservations_waiterId_idx" ON "reservations"("waiterId");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "waiters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
