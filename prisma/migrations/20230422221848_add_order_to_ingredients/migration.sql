/*
  Warnings:

  - A unique constraint covering the columns `[ingredientSectionId,order]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recipeId,order]` on the table `IngredientSection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `IngredientSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "IngredientSection" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_ingredientSectionId_order_key" ON "Ingredient"("ingredientSectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientSection_recipeId_order_key" ON "IngredientSection"("recipeId", "order");
