import {
  isValidVisibilityConfiguration,
  isVisibilityValidForCollection,
} from "./collectionUtils";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("collectionUtils", () => {
  test.each([
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.PUBLIC, true],
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.UNLISTED, true],
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.PRIVATE, true],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.PUBLIC, false],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.UNLISTED, true],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.PRIVATE, true],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.PUBLIC, false],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.UNLISTED, false],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.PRIVATE, true],
  ])(
    "%s recipe visibility and %s collection visibility is %s",
    (recipeVisibility, recipeCollectionVisibility, isValid) => {
      expect(
        isVisibilityValidForCollection(
          recipeVisibility,
          recipeCollectionVisibility,
        ),
      ).toBe(isValid);
    },
  );

  test("should not be able to add public and unlisted recipes to a public collection", () => {
    const validity = isValidVisibilityConfiguration(
      RecipeCollectionVisibility.PUBLIC,
      [
        {
          id: 1,
          visibility: RecipeVisibility.PUBLIC,
        },
        {
          id: 2,
          visibility: RecipeVisibility.UNLISTED,
        },
      ],
    );

    expect(validity.isValid).toBe(false);
    expect(validity.violatingRecipes).toEqual([
      {
        id: 2,
        visibility: RecipeVisibility.UNLISTED,
      },
    ]);
  });

  test("should not be able to add private and unlisted recipes to a public collection", () => {
    const validity = isValidVisibilityConfiguration(
      RecipeCollectionVisibility.PUBLIC,
      [
        {
          id: 1,
          visibility: RecipeVisibility.PRIVATE,
        },
        {
          id: 2,
          visibility: RecipeVisibility.UNLISTED,
        },
      ],
    );

    expect(validity.isValid).toBe(false);
    expect(validity.violatingRecipes).toEqual([
      {
        id: 1,
        visibility: RecipeVisibility.PRIVATE,
      },
      {
        id: 2,
        visibility: RecipeVisibility.UNLISTED,
      },
    ]);
  });
});
