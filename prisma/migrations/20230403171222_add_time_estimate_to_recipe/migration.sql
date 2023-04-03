-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "timeEstimateMaximumMinutes" INTEGER,
ADD COLUMN     "timeEstimateMinimumMinutes" INTEGER NOT NULL DEFAULT 0;
