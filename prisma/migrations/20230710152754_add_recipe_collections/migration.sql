-- CreateTable
CREATE TABLE "RecipeCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipesOnCollections" (
    "recipeId" TEXT NOT NULL,
    "recipeCollectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipesOnCollections_pkey" PRIMARY KEY ("recipeId","recipeCollectionId")
);

-- AddForeignKey
ALTER TABLE "RecipeCollection" ADD CONSTRAINT "RecipeCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipesOnCollections" ADD CONSTRAINT "RecipesOnCollections_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipesOnCollections" ADD CONSTRAINT "RecipesOnCollections_recipeCollectionId_fkey" FOREIGN KEY ("recipeCollectionId") REFERENCES "RecipeCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
