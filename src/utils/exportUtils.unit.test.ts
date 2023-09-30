import { recipeToMarkdown } from "./exportUtils";
import { RecipeVisibility } from "@prisma/client";

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
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
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
                isOptional: true,
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
                quantity: 2,
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
            description: `<p>Boil for <countdown-component seconds="15732"></countdown-component></p>`,
            order: 1,
            recipeId: "recipeId_1",
          },
        ],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
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
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: This is a test recipe
quantity: 1
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

- 1 cup of Test Ingredient
- 1 milliliter of tomatoes (optional)

### Topping

- 1 cup of Test Ingredient
- 2 milliliters of tomatoes

## Instructions

1. This is a test instruction 1
2. Boil for 4h 22min 12s
`);
  });

  test("should return correct markdown for recipe without ingredients", () => {
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
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
        ingredientSections: [
          {
            id: "ingredientSectionId_1",
            name: "Sauce",
            order: 0,
            recipeId: "recipeId_1",
            ingredients: [],
          },
          {
            id: "ingredientSectionId_2",
            name: "Topping",
            order: 1,
            recipeId: "recipeId_1",
            ingredients: [],
          },
          {
            id: "ingredientSectionId_3",
            name: "Bread",
            order: 2,
            recipeId: "recipeId_1",
            ingredients: [],
          },
        ],
        instructions: [
          {
            id: "instructionId_1",
            description: "This is a test instruction 1",
            order: 0,
            recipeId: "recipeId_1",
          },
        ],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
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
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: This is a test recipe
quantity: 1
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

### Topping

### Bread

## Instructions

1. This is a test instruction 1
`);
  });

  test("should return correct markdown for recipe without ingredient sections", () => {
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
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
        ingredientSections: [],
        instructions: [
          {
            id: "instructionId_1",
            description: "This is a test instruction 1",
            order: 0,
            recipeId: "recipeId_1",
          },
        ],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
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
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: This is a test recipe
quantity: 1
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

## Instructions

1. This is a test instruction 1
`);
  });

  test("should return correct markdown for recipe without ingredient sections and instructions", () => {
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
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
        ingredientSections: [],
        instructions: [],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
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
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: This is a test recipe
quantity: 1
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
`);
  });

  test("should return correct markdown for recipe without description, ingredient sections and instructions", () => {
    const markdown = recipeToMarkdown(
      {
        user: {
          clerkId: "userId_1",
          username: "test_user",
        },
        id: "recipeId_1",
        name: "Test Recipe",
        description: "",
        coverImageName: null,
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
        ingredientSections: [],
        instructions: [],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
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
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: 
quantity: 1
visibility: public
created: 2018-05-16T12:16:17.000Z
updated: 2019-09-20T12:16:17.000Z
author: test_user
tags: Lactose-free, Vegan
views: 13
timeEstimate: 10-20
---

# Test Recipe
`);
  });

  test("should return correct markdown for recipe without description and ingredient sections", () => {
    const markdown = recipeToMarkdown(
      {
        user: {
          clerkId: "userId_1",
          username: "test_user",
        },
        id: "recipeId_1",
        name: "Test Recipe",
        description: "",
        coverImageName: null,
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
        ingredientSections: [],
        instructions: [
          {
            id: "instructionId_1",
            description: "Bake the bread",
            order: 0,
            recipeId: "recipeId_1",
          },
        ],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
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
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: 
quantity: 1
visibility: public
created: 2018-05-16T12:16:17.000Z
updated: 2019-09-20T12:16:17.000Z
author: test_user
tags: Lactose-free, Vegan
views: 13
timeEstimate: 10-20
---

# Test Recipe

## Instructions

1. Bake the bread
`);
  });

  test("should return correct markdown for recipe without description, ingredient sections and tags", () => {
    const markdown = recipeToMarkdown(
      {
        user: {
          clerkId: "userId_1",
          username: "test_user",
        },
        id: "recipeId_1",
        name: "Test Recipe",
        description: "",
        coverImageName: null,
        createdAt: new Date("2018-05-16T12:16:17.000Z"),
        updatedAt: new Date("2019-09-20T12:16:17.000Z"),
        ingredientSections: [],
        instructions: [
          {
            id: "instructionId_1",
            description: "Bake the bread",
            order: 0,
            recipeId: "recipeId_1",
          },
        ],
        quantity: 1,
        visibility: RecipeVisibility.PUBLIC,
        timeEstimateMinimumMinutes: 10,
        timeEstimateMaximumMinutes: 20,
        tags: [],
        userId: "userId_1",
        viewCount: 13,
        _count: {
          likes: 5,
        },
      },
      "en",
    );

    expect(markdown).toBe(`---
id: recipeId_1
name: Test Recipe
description: 
quantity: 1
visibility: public
created: 2018-05-16T12:16:17.000Z
updated: 2019-09-20T12:16:17.000Z
author: test_user
views: 13
timeEstimate: 10-20
---

# Test Recipe

## Instructions

1. Bake the bread
`);
  });
});
