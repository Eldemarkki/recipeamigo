import { capitalizeFirstLetter } from "./stringUtils";

describe("stringUtils", () => {
  it("should capitalize first letter in long string", () => {
    expect(capitalizeFirstLetter("hello world")).toBe("Hello world");
  });

  it("should capitalize first letter in short string", () => {
    expect(capitalizeFirstLetter("h")).toBe("H");
  });

  it("should capitalize first letter in empty string", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });
});
