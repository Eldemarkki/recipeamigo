const knownHttpErrorStatuses = [400, 401, 403, 404, 409, 500] as const;

export enum ErrorCode {
  Unknown = "UNKNOWN",
  InternalServerError = "INTERNAL_SERVER_ERROR",
  InvalidQueryParameters = "INVALID_QUERY_PARAMETERS",
  BadRequest = "BAD_REQUEST",
  Unauthorized = "UNAUTHORIZED",
  RecipeNotFound = "RECIPE_NOT_FOUND",
  RecipesNotFound = "RECIPES_NOT_FOUND",
  CollectionNotFound = "COLLECTION_NOT_FOUND",
  RecipeAlreadyLiked = "RECIPE_ALREADY_LIKED",
  RecipeAlreadyUnliked = "RECIPE_ALREADY_UNLIKED",
  CannotLikeOwnRecipe = "CANNOT_LIKE_OWN_RECIPE",
  CannotUnlikeOwnRecipe = "CANNOT_UNLIKE_OWN_RECIPE",
  RecipesMustBePublic = "RECIPES_MUST_BE_PUBLIC",
  RecipesMustBePublicOrUnlisted = "RECIPES_MUST_BE_PUBLIC_OR_UNLISTED",
  CannotAddRecipeToCollectionsDontExistOrNoReadAccess = "CANNOT_ADD_RECIPE_TO_COLLECTIONS_DONT_EXIST_OR_NO_READ_ACCESS",
  CannotAddRecipeToCollectionsNoWriteAccess = "CANNOT_ADD_RECIPE_TO_COLLECTIONS_NO_WRITE_ACCESS",
  CannotAddRecipeToCollectionsInvalidVisibility = "CANNOT_ADD_RECIPE_TO_COLLECTIONS_INVALID_VISIBILITY",
  UserNotFound = "USER_NOT_FOUND",
  UsernameAlreadyTaken = "USERNAME_ALREADY_TAKEN",
  IngredientSectionsNotFound = "INGREDIENT_SECTIONS_NOT_FOUND",
  IngredientsNotFound = "INGREDIENTS_NOT_FOUND",
  InstructionsNotFound = "INSTRUCTIONS_NOT_FOUND",
  ProfileAlreadyExists = "PROFILE_ALREADY_EXISTS",
}

export const isErrorCode = (code: string): code is ErrorCode => {
  return Object.values(ErrorCode).includes(code as ErrorCode);
};

export const getErrorFromResponse = async (response: Response) => {
  let errorObj: unknown;
  try {
    errorObj = (await response.json()) as unknown;
  } catch (e) {
    console.error(e);
    errorObj = undefined;
  }

  if (
    typeof errorObj === "object" &&
    errorObj !== null &&
    "message" in errorObj &&
    typeof errorObj.message === "string" &&
    "code" in errorObj &&
    typeof errorObj.code === "string" &&
    isErrorCode(errorObj.code)
  ) {
    return {
      errorCode: errorObj.code,
    };
  } else {
    return {
      errorCode: ErrorCode.Unknown,
    };
  }
};

export type HttpStatusCode = (typeof knownHttpErrorStatuses)[number];

export const isKnownHttpStatusCode = (
  status: number,
): status is HttpStatusCode => {
  return knownHttpErrorStatuses.includes(status as HttpStatusCode);
};

export class HttpError extends Error {
  public code: ErrorCode;

  constructor(
    code: ErrorCode,
    message: string,
    public status: HttpStatusCode,
  ) {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends HttpError {
  constructor(code: ErrorCode, message?: string) {
    super(code, message || "Not found", 404);
  }
}

export class ForbiddenError extends HttpError {
  constructor(code: ErrorCode, message?: string) {
    super(code, message || "Forbidden", 403);
  }
}

export class ConflictError extends HttpError {
  constructor(code: ErrorCode, message?: string) {
    super(code, message || "Conflict", 409);
  }
}

export class RecipeNotFoundError extends NotFoundError {
  constructor(recipeId: string) {
    super(ErrorCode.RecipeNotFound, `Recipe with id ${recipeId} not found`);
  }
}

export class RecipesNotFoundError extends NotFoundError {
  constructor(missingRecipeIds: string[]) {
    super(
      ErrorCode.RecipesNotFound,
      `Recipes with ids ${missingRecipeIds.join(", ")} not found`,
    );
  }
}

export class CollectionNotFoundError extends NotFoundError {
  constructor(collectionId: string) {
    super(
      ErrorCode.CollectionNotFound,
      `Collection with id ${collectionId} not found`,
    );
  }
}

export class UnauthorizedError extends HttpError {
  constructor(code: ErrorCode, message?: string) {
    super(code, message || "Not authenticated", 401);
  }
}

export class BadRequestError extends HttpError {
  constructor(code: ErrorCode, message?: string) {
    super(code, message || "Bad request", 400);
  }
}

export class InvalidQueryParametersError extends BadRequestError {
  constructor(code: ErrorCode, message?: string) {
    super(code, "Invalid query parameters: " + message);
  }
}

export class RecipeAlreadyLikedError extends BadRequestError {
  constructor(recipeId: string) {
    super(
      ErrorCode.RecipeAlreadyLiked,
      `Recipe with id ${recipeId} already liked`,
    );
  }
}

export class RecipeAlreadyUnlikedError extends BadRequestError {
  constructor(recipeId: string) {
    super(
      ErrorCode.RecipeAlreadyUnliked,
      `Recipe with id ${recipeId} already unliked`,
    );
  }
}

export class CannotLikeOwnRecipeError extends BadRequestError {
  constructor() {
    super(ErrorCode.CannotLikeOwnRecipe, "Cannot like own recipe");
  }
}

export class CannotUnlikeOwnRecipeError extends BadRequestError {
  constructor() {
    super(ErrorCode.CannotUnlikeOwnRecipe, "Cannot unlike own recipe");
  }
}

export class RecipesMustBePublicError extends BadRequestError {
  constructor(violatingRecipeIds: string[]) {
    super(
      ErrorCode.RecipesMustBePublic,
      "All recipes must be public to be added to a public collection. The following recipes are not public: " +
        violatingRecipeIds.join(", "),
    );
  }
}

export class RecipesMustBePublicOrUnlistedError extends BadRequestError {
  constructor(violatingRecipeIds: string[]) {
    super(
      ErrorCode.RecipesMustBePublicOrUnlisted,
      "All recipes must be public or unlisted to be added to a unlisted collection. The following recipes are not public or unlisted: " +
        violatingRecipeIds.join(", "),
    );
  }
}

export class CannotAddRecipeToCollectionsDontExistOrNoReadAccessError extends NotFoundError {
  constructor(recipeId: string, invalidCollectionIds: string[]) {
    super(
      ErrorCode.CannotAddRecipeToCollectionsDontExistOrNoReadAccess,
      `Cannot add recipe with id ${recipeId} to collections: [${invalidCollectionIds.join(
        ",",
      )}]. Make sure they exist and you have read access to them.`,
    );
  }
}

export class CannotAddRecipeToCollectionsNoWriteAccessError extends ForbiddenError {
  constructor(recipeId: string, invalidCollectionIds: string[]) {
    super(
      ErrorCode.CannotAddRecipeToCollectionsNoWriteAccess,
      `Cannot add recipe with id ${recipeId} to collections: [${invalidCollectionIds.join(
        ",",
      )}]. Make sure you have write access to them.`,
    );
  }
}

export class CannotAddRecipeToCollectionsInvalidVisibilityError extends BadRequestError {
  constructor(recipeId: string, invalidCollectionIds: string[]) {
    super(
      ErrorCode.CannotAddRecipeToCollectionsInvalidVisibility,
      `Cannot add recipe with id ${recipeId} to collections: [${invalidCollectionIds.join(
        ",",
      )}]. Make sure the collection visibilities are valid for the recipe.`,
    );
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(username: string) {
    super(ErrorCode.UserNotFound, `User with username ${username} not found`);
  }
}

export class UsernameAlreadyTakenError extends ConflictError {
  constructor(username: string) {
    super(ErrorCode.UsernameAlreadyTaken, `Username ${username} already taken`);
  }
}

export class IngredientSectionsNotFoundError extends NotFoundError {
  constructor(missingIngredientSectionIds: string[]) {
    super(
      ErrorCode.IngredientSectionsNotFound,
      `Ingredient sections with ids ${missingIngredientSectionIds.join(
        ", ",
      )} not found`,
    );
  }
}

export class IngredientsNotFoundError extends NotFoundError {
  constructor(missingIngredientIds: string[]) {
    super(
      ErrorCode.IngredientsNotFound,
      `Ingredients with ids ${missingIngredientIds.join(", ")} not found`,
    );
  }
}

export class InstructionsNotFoundError extends NotFoundError {
  constructor(missingInstructionIds: string[]) {
    super(
      ErrorCode.InstructionsNotFound,
      `Instructions with ids ${missingInstructionIds.join(", ")} not found`,
    );
  }
}

export class ProfileAlreadyExistsError extends ConflictError {
  constructor() {
    super(ErrorCode.ProfileAlreadyExists, "Profile already exists");
  }
}
