import { splitSeconds } from "./recipeUtils";

describe("splitSeconds", () => {
  test("should return correct split for 0 seconds", () => {
    expect(splitSeconds(0)).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("should return correct split for 1 second", () => {
    expect(splitSeconds(1)).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
  });

  test("should return correct split for 60 seconds", () => {
    expect(splitSeconds(60)).toEqual({
      hours: 0,
      minutes: 1,
      seconds: 0,
    });
  });

  test("should return correct split for 61 seconds", () => {
    expect(splitSeconds(61)).toEqual({
      hours: 0,
      minutes: 1,
      seconds: 1,
    });
  });

  test("should return correct split for 3600 seconds", () => {
    expect(splitSeconds(3600)).toEqual({
      hours: 1,
      minutes: 0,
      seconds: 0,
    });
  });

  test("should return correct split for 3601 seconds", () => {
    expect(splitSeconds(3601)).toEqual({
      hours: 1,
      minutes: 0,
      seconds: 1,
    });
  });

  test("should return correct split for 3661 seconds", () => {
    expect(splitSeconds(3661)).toEqual({
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });

  test("should return correct split for 15732 seconds", () => {
    expect(splitSeconds(15732)).toEqual({
      hours: 4,
      minutes: 22,
      seconds: 12,
    });
  });
});
