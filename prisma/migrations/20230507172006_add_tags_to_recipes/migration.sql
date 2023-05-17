-- CreateTable
CREATE TABLE "Tag" (
    "text" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("recipeId","text")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_recipeId_order_key" ON "Tag"("recipeId", "order");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
