/*
  Warnings:

  - The primary key for the `UserProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hankoId` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userId_fkey";

-- DropIndex
DROP INDEX "UserProfile_hankoId_key";

-- AlterTable
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_pkey",
DROP COLUMN "hankoId",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_clerkId_key" ON "UserProfile"("clerkId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
