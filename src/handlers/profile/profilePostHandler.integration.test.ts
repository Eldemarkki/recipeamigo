import { getUserAndPublicRecipesAndPublicCollectionsByUsername } from "../../database/users";
import { resetDatabase } from "../../db";
import { UsernameAlreadyTakenError } from "../../utils/errors";
import {
  createRandomString,
  createUserToDatabaseAndAuthenticate,
} from "../../utils/tests/testUtils";
import { profilePostHandler } from "./profilePostHandler";

describe("profilePostHandler", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test("should create profile", async () => {
    const existingUser =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername(
        "my username",
      );
    expect(existingUser).toBeNull();

    await profilePostHandler.handler(
      {
        userId: createRandomString(16),
        status: "No profile",
      },
      {
        name: "my username",
      },
    );

    const newUser =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername(
        "my username",
      );
    expect(newUser).not.toBeNull();
    if (newUser) {
      expect(newUser.username).toBe("my username");
    }
  });

  test("can not create profile with a duplicate username", async () => {
    await createUserToDatabaseAndAuthenticate("my username");
    const fn = () =>
      profilePostHandler.handler(
        {
          userId: createRandomString(16),
          status: "No profile",
        },
        {
          name: "my username",
        },
      );

    await expect(fn).rejects.toThrowError(
      new UsernameAlreadyTakenError("my username"),
    );
  });

  test("can not create profile with a duplicate username, case-insensitive", async () => {
    await createUserToDatabaseAndAuthenticate("my username");
    const fn = () =>
      profilePostHandler.handler(
        {
          userId: createRandomString(16),
          status: "No profile",
        },
        {
          name: "MY USERNAME",
        },
      );

    await expect(fn).rejects.toThrowError(
      new UsernameAlreadyTakenError("MY USERNAME"),
    );

    const user =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername(
        "MY USERNAME",
      );
    expect(user).toBeNull();
  });
});
