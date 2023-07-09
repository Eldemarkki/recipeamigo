import { recipeToMarkdown } from "./exportUtils";

// TODO: Add tests for if there are no ingredients, ingredient sections, instructions or tags or if they are empty
// I think the recipeToMarkdown leaves extra empty lines if one of those arrays are empty, so it's partially
// incorrect at the moment.

describe("recipeToMarkdown", () => {
  test("should return correct markdown for basic recipe with everything", () => {
    const markdown = recipeToMarkdown(
      {
        user: {
          clerkId: "userId_1",
          username: "test_user",
        },
        id: "recipeId_1",
        name: "Test Recipe",
        description: "This is a test recipe",
        coverImageName: null,
        createdAt: new Date(2018, 4, 16, 15, 16, 17),
        updatedAt: new Date(2019, 8, 20, 15, 16, 17),
        ingredientSections: [
          {
            id: "ingredientSectionId_1",
            name: "Sauce",
            order: 0,
            recipeId: "recipeId_1",
            ingredients: [
              {
                id: "ingredientId_1",
                name: "Test Ingredient",
                quantity: 1,
                unit: "CUP",
                isOptional: false,
                order: 0,
                ingredientSectionId: "ingredientSectionId_1",
              },
              {
                id: "ingredientId_2",
                name: "tomato",
                quantity: 1,
                unit: "MILLILITER",
                isOptional: false,
                order: 1,
                ingredientSectionId: "ingredientSectionId_1",
              },
            ],
          },
          {
            id: "ingredientSectionId_2",
            name: "Topping",
            order: 1,
            recipeId: "recipeId_1",
            ingredients: [
              {
                id: "ingredientId_3",
                name: "Test Ingredient",
                quantity: 1,
                unit: "CUP",
                isOptional: false,
                order: 0,
                ingredientSectionId: "ingredientSectionId_2",
              },
              {
                id: "ingredientId_4",
                name: "tomato",
                quantity: 1,
                unit: "MILLILITER",
                isOptional: false,
                order: 1,
                ingredientSectionId: "ingredientSectionId_2",
              },
            ],
          },
        ],
        instructions: [
          {
            id: "instructionId_1",
            description: "This is a test instruction 1",
            order: 0,
            recipeId: "recipeId_1",
          },
          {
            id: "instructionId_2",
            description: "This is a test instruction 2",
            order: 1,
            recipeId: "recipeId_1",
          },
        ],
        quantity: 1,
        isPublic: true,
        timeEstimateMinimumMinutes: 10,
        timeEstimateMaximumMinutes: 20,
        tags: [
          {
            order: 0,
            recipeId: "recipeId_1",
            text: "Lactose-free",
          },
          {
            order: 1,
            recipeId: "recipeId_1",
            text: "Vegan",
          },
        ],
        userId: "userId_1",
        viewCount: 13,
      },
      "en"
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: This is a test recipe
visibility: public
created: 2018-05-16T12:16:17.000Z
updated: 2019-09-20T12:16:17.000Z
author: test_user
tags: Lactose-free, Vegan
views: 13
timeEstimate: 10-20
---

# Test Recipe

This is a test recipe

## Ingredients

### Sauce

- 1 cups Test Ingredient
- 1 milliliter of tomatoes

### Topping

- 1 cups Test Ingredient
- 1 milliliter of tomatoes

## Instructions

1. This is a test instruction 1
2. This is a test instruction 2
`);
  });
});
