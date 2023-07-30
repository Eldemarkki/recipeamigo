/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Recipe` table. All the data in the column will be lost.
  - Added the required column `visibility` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecipeVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- AlterTable
ALTER TABLE "Recipe" 
    ADD COLUMN "visibility" "RecipeVisibility" NOT NULL 
        DEFAULT 'PRIVATE' 
        CHECK ("visibility" IN ('PUBLIC', 'PRIVATE', 'UNLISTED'));

UPDATE "Recipe" 
    SET "visibility" = CASE 
                        WHEN "isPublic" THEN 'PUBLIC'::"RecipeVisibility"
                        ELSE 'PRIVATE'::"RecipeVisibility"
                        END;

ALTER TABLE "Recipe" DROP COLUMN "isPublic";
ALTER TABLE "Recipe" ALTER COLUMN "visibility" DROP DEFAULT;
