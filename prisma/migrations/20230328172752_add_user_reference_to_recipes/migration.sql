-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("hankoId") ON DELETE RESTRICT ON UPDATE CASCADE;
