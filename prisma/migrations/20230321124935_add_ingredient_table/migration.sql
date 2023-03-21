-- CreateEnum
CREATE TYPE "IngredientUnit" AS ENUM ('GRAM', 'CUP', 'TEASPOON', 'TABLESPOON', 'OUNCE', 'POUND', 'MILLILITER', 'DECILITER', 'LITER', 'PINCH', 'DASH', 'CLOVE', 'QUART', 'PINT', 'GALLON', 'KILOGRAM', 'SLICE', 'HANDFUL', 'CAN', 'BOTTLE', 'PACKAGE');

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "IngredientUnit",
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
