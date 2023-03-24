/*
  Warnings:

  - Added the required column `isPublic` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "isPublic" BOOLEAN NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;
