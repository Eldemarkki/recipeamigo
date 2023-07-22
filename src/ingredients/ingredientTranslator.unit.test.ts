import { getIngredientText } from "./ingredientTranslator";

describe("ingredientTranslator", () => {
  test("should translate 1 kilogram of tomatoes in English", () => {
    expect(getIngredientText("tomato", 1, "KILOGRAM", false, "en")).toBe(
      "1 kilogram of tomatoes",
    );
  });

  test("should translate 1 kilogram of tomatoes in Finnish", () => {
    expect(getIngredientText("tomato", 1, "KILOGRAM", false, "fi")).toBe(
      "1 kilogramma tomaattia",
    );
  });

  test("should translate 1 tomato in English", () => {
    expect(getIngredientText("tomato", 1, null, false, "en")).toBe("1 tomato");
  });

  test("should translate 1 tomato in Finnish", () => {
    expect(getIngredientText("tomato", 1, null, false, "fi")).toBe(
      "1 tomaatti",
    );
  });

  test("should translate 2 tomatoes in English", () => {
    expect(getIngredientText("tomato", 2, null, false, "en")).toBe(
      "2 tomatoes",
    );
  });

  test("should translate 2 tomatoes in Finnish", () => {
    expect(getIngredientText("tomato", 2, null, false, "fi")).toBe(
      "2 tomaattia",
    );
  });

  test("should translate 1 cup of tomatoes in English", () => {
    expect(getIngredientText("tomato", 1, "CUP", false, "en")).toBe(
      "1 cup of tomatoes",
    );
  });

  test("should translate 1 cup of tomatoes in Finnish", () => {
    expect(getIngredientText("tomato", 1, "CUP", false, "fi")).toBe(
      "1 kuppi tomaattia",
    );
  });

  test("should translate 2 cups of tomatoes in English", () => {
    expect(getIngredientText("tomato", 2, "CUP", false, "en")).toBe(
      "2 cups of tomatoes",
    );
  });

  test("should translate 2 cups of tomatoes in Finnish", () => {
    expect(getIngredientText("tomato", 2, "CUP", false, "fi")).toBe(
      "2 kuppia tomaattia",
    );
  });

  test("should translate 1 clove of garlic in English", () => {
    expect(getIngredientText("garlic", 1, "CLOVE", false, "en")).toBe(
      "1 clove of garlic",
    );
  });

  test("should translate 1 clove of garlic in Finnish", () => {
    expect(getIngredientText("garlic", 1, "CLOVE", false, "fi")).toBe(
      "1 kynsi valkosipulia",
    );
  });

  test("should translate 2 cloves of garlic in English", () => {
    expect(getIngredientText("garlic", 2, "CLOVE", false, "en")).toBe(
      "2 cloves of garlic",
    );
  });

  test("should translate 2 cloves of garlic in Finnish", () => {
    expect(getIngredientText("garlic", 2, "CLOVE", false, "fi")).toBe(
      "2 kynttä valkosipulia",
    );
  });

  test("should translate 1 garlic in English", () => {
    expect(getIngredientText("garlic", 1, null, false, "en")).toBe("1 garlic");
  });

  test("should translate 1 garlic in Finnish", () => {
    expect(getIngredientText("garlic", 1, null, false, "fi")).toBe(
      "1 valkosipuli",
    );
  });

  test("should translate 2 garlics in English", () => {
    // TODO: This is not correct English
    expect(getIngredientText("garlic", 2, null, false, "en")).toBe("2 garlic");
  });

  test("should translate 2 garlics in Finnish", () => {
    expect(getIngredientText("garlic", 2, null, false, "fi")).toBe(
      "2 valkosipulia",
    );
  });
});
