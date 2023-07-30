/*
  Warnings:

  - Added the required column `visibility` to the `RecipeCollection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecipeCollectionVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- AlterTable
ALTER TABLE "RecipeCollection" ADD COLUMN     "visibility" "RecipeCollectionVisibility" NOT NULL;
