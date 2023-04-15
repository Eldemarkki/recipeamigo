import { randomUUID } from "crypto";
import { getAllRecipesForUser } from "./recipes";
import { prisma } from "../db";

describe("recipes", () => {
  it("should return all recipes for user", async () => {
    const userId = randomUUID();
    console.log(userId);
    await prisma.userProfile.create({
      data: {
        hankoId: userId,
        username: "GreenSpaceBean123"
      }
    });

    const recipes = await getAllRecipesForUser(userId);

    expect(recipes).toHaveLength(0);
  });
});
