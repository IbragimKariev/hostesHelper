-- CreateTable
CREATE TABLE "halls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "pixelRatio" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "walls" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "halls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,
    "shape" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "sizeWidth" DOUBLE PRECISION NOT NULL,
    "sizeHeight" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "section" TEXT,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seatConfiguration" TEXT,
    "hallId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "hallId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tables_hallId_number_key" ON "tables"("hallId", "number");

-- CreateIndex
CREATE INDEX "reservations_date_idx" ON "reservations"("date");

-- CreateIndex
CREATE INDEX "reservations_hallId_idx" ON "reservations"("hallId");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
