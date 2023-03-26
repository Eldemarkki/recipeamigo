/*
  Warnings:

  - You are about to drop the column `recipeId` on the `Ingredient` table. All the data in the column will be lost.
  - Added the required column `ingredientSectionId` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_recipeId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "recipeId",
ADD COLUMN     "ingredientSectionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "IngredientSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "IngredientSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IngredientSection" ADD CONSTRAINT "IngredientSection_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_ingredientSectionId_fkey" FOREIGN KEY ("ingredientSectionId") REFERENCES "IngredientSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
