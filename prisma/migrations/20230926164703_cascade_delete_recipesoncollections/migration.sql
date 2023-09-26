-- DropForeignKey
ALTER TABLE "RecipesOnCollections" DROP CONSTRAINT "RecipesOnCollections_recipeCollectionId_fkey";

-- AddForeignKey
ALTER TABLE "RecipesOnCollections" ADD CONSTRAINT "RecipesOnCollections_recipeCollectionId_fkey" FOREIGN KEY ("recipeCollectionId") REFERENCES "RecipeCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
