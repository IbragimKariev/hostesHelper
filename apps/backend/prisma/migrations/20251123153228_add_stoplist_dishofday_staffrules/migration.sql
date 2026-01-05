-- CreateTable
CREATE TABLE "stop_list_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT,
    "category" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stop_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes_of_day" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_of_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_rules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stop_list_items_date_idx" ON "stop_list_items"("date");

-- CreateIndex
CREATE INDEX "stop_list_items_isActive_idx" ON "stop_list_items"("isActive");

-- CreateIndex
CREATE INDEX "dishes_of_day_date_idx" ON "dishes_of_day"("date");

-- CreateIndex
CREATE INDEX "dishes_of_day_isActive_idx" ON "dishes_of_day"("isActive");

-- CreateIndex
CREATE INDEX "staff_rules_isActive_idx" ON "staff_rules"("isActive");

-- CreateIndex
CREATE INDEX "staff_rules_priority_idx" ON "staff_rules"("priority");
