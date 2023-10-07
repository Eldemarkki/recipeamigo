import { getUserAndPublicRecipesAndPublicCollectionsByUsername } from "../../database/users";
import { resetDatabase } from "../../db";
import { UsernameAlreadyTakenError } from "../../utils/errors";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { profilePutHandler } from "./profilePutHandler";

describe("profilePutHandler", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test("should change the username of the user", async () => {
    const user = await createUserToDatabaseAndAuthenticate("oldUsername");
    const oldUserData =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername(
        "oldUsername",
      );
    expect(oldUserData).not.toBeNull();
    if (!oldUserData)
      throw new Error("oldUserData is null. This should never happen");
    expect(oldUserData.username).toBe("oldUsername");

    await profilePutHandler.handler(user, { name: "newUsername" });

    const newUserData =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername(
        "newUsername",
      );

    expect(newUserData).not.toBeNull();
    if (!newUserData)
      throw new Error("newUserData is null. This should never happen");

    expect(newUserData.username).toBe("newUsername");
  });

  test("can not change to an existing username", async () => {
    const user1 = await createUserToDatabaseAndAuthenticate("user1");
    await createUserToDatabaseAndAuthenticate("user2");

    await expect(
      profilePutHandler.handler(user1, { name: "user2" }),
    ).rejects.toThrowError(new UsernameAlreadyTakenError("user2"));
  });

  test("can not change to an existing username if case is different", async () => {
    const user1 = await createUserToDatabaseAndAuthenticate("user1");
    await createUserToDatabaseAndAuthenticate("user2");

    await expect(
      profilePutHandler.handler(user1, { name: "USER2" }),
    ).rejects.toThrowError(new UsernameAlreadyTakenError("USER2"));
  });

  test("can change to the same username with different case if username is own username", async () => {
    const user1 = await createUserToDatabaseAndAuthenticate("user1");

    await profilePutHandler.handler(user1, { name: "USER1" });

    const newUserData =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername("USER1");

    expect(newUserData).not.toBeNull();
    if (!newUserData)
      throw new Error("newUserData is null. This should never happen");

    expect(newUserData.username).toBe("USER1");
  });
});
