/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "coverImageUrl",
ADD COLUMN     "coverImageName" TEXT;
