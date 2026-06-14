-- AlterTable
ALTER TABLE "Food" ADD COLUMN "averagePrice" DOUBLE PRECISION, ADD COLUMN "currency" TEXT DEFAULT 'USD';

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "caloriesTarget" DOUBLE PRECISION NOT NULL,
    "proteinTarget" DOUBLE PRECISION NOT NULL,
    "carbsTarget" DOUBLE PRECISION NOT NULL,
    "fatTarget" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentPlanId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "timezone" TEXT,
    "regenerationsCount" INTEGER NOT NULL DEFAULT 0,
    "replacementsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanDay" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fats" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MealPlanDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanMeal" (
    "id" TEXT NOT NULL,
    "mealPlanDayId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "foodId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fats" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "completedAt" TIMESTAMP(3),
    "loggedMealId" TEXT,

    CONSTRAINT "MealPlanMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "planData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "mealId" TEXT,
    "foodId" TEXT,
    "interactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannerInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanMeal_loggedMealId_key" ON "MealPlanMeal"("loggedMealId");

-- CreateIndex
CREATE INDEX "MealPlan_userId_idx" ON "MealPlan"("userId");

-- CreateIndex
CREATE INDEX "MealPlanDay_mealPlanId_idx" ON "MealPlanDay"("mealPlanId");

-- CreateIndex
CREATE INDEX "MealPlanMeal_mealPlanDayId_idx" ON "MealPlanMeal"("mealPlanDayId");

-- CreateIndex
CREATE INDEX "SavedTemplate_userId_idx" ON "SavedTemplate"("userId");

-- CreateIndex
CREATE INDEX "PantryItem_userId_idx" ON "PantryItem"("userId");

-- CreateIndex
CREATE INDEX "PlannerInteraction_userId_idx" ON "PlannerInteraction"("userId");

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_parentPlanId_fkey" FOREIGN KEY ("parentPlanId") REFERENCES "MealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanDay" ADD CONSTRAINT "MealPlanDay_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanMeal" ADD CONSTRAINT "MealPlanMeal_mealPlanDayId_fkey" FOREIGN KEY ("mealPlanDayId") REFERENCES "MealPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanMeal" ADD CONSTRAINT "MealPlanMeal_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanMeal" ADD CONSTRAINT "MealPlanMeal_loggedMealId_fkey" FOREIGN KEY ("loggedMealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTemplate" ADD CONSTRAINT "SavedTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerInteraction" ADD CONSTRAINT "PlannerInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
