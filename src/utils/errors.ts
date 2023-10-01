const knownHttpErrorStatuses = [400, 401, 403, 404, 409, 500] as const;
export type HttpStatusCode = (typeof knownHttpErrorStatuses)[number];

export const isKnownHttpStatusCode = (
  status: number,
): status is HttpStatusCode => {
  return knownHttpErrorStatuses.includes(status as HttpStatusCode);
};

export class HttpError extends Error {
  constructor(
    message: string,
    public status: HttpStatusCode,
  ) {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(message || "Not found", 404);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(message || "Forbidden", 403);
  }
}

export class RecipeNotFoundError extends NotFoundError {
  constructor(recipeId: string) {
    super(`Recipe with id ${recipeId} not found`);
  }
}

export class RecipesNotFoundError extends NotFoundError {
  constructor(missingRecipeIds: string[]) {
    super(`Recipes with ids ${missingRecipeIds.join(", ")} not found`);
  }
}

export class CollectionNotFoundError extends NotFoundError {
  constructor(collectionId: string) {
    super(`Collection with id ${collectionId} not found`);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(message || "Not authenticated", 401);
  }
}

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(message || "Bad request", 400);
  }
}

export class InvalidQueryParametersError extends BadRequestError {
  constructor(message?: string) {
    super("Invalid query parameters: " + message);
  }
}

export class RecipeAlreadyLikedError extends BadRequestError {
  constructor(recipeId: string) {
    super(`Recipe with id ${recipeId} already liked`);
  }
}

export class RecipeAlreadyUnlikedError extends BadRequestError {
  constructor(recipeId: string) {
    super(`Recipe with id ${recipeId} already unliked`);
  }
}

export class CannotLikeOwnRecipeError extends BadRequestError {
  constructor() {
    super("Cannot like own recipe");
  }
}

export class CannotUnlikeOwnRecipeError extends BadRequestError {
  constructor() {
    super("Cannot unlike own recipe");
  }
}

export class RecipesMustBePublicError extends BadRequestError {
  constructor(violatingRecipeIds: string[]) {
    super(
      "All recipes must be public to be added to a public collection. The following recipes are not public: " +
        violatingRecipeIds.join(", "),
    );
  }
}

export class RecipesMustBePublicOrUnlistedError extends BadRequestError {
  constructor(violatingRecipeIds: string[]) {
    super(
      "All recipes must be public or unlisted to be added to a unlisted collection. The following recipes are not public or unlisted: " +
        violatingRecipeIds.join(", "),
    );
  }
}

export class CannotAddRecipeToCollectionsErrorDontExistOrNoReadAccess extends NotFoundError {
  constructor(recipeId: string, invalidCollectionIds: string[]) {
    super(
      `Cannot add recipe with id ${recipeId} to collections: [${invalidCollectionIds.join(
        ",",
      )}]. Make sure they exist and you have read access to them.`,
    );
  }
}

export class CannotAddRecipeToCollectionsNoWriteAccessError extends ForbiddenError {
  constructor(recipeId: string, invalidCollectionIds: string[]) {
    super(
      `Cannot add recipe with id ${recipeId} to collections: [${invalidCollectionIds.join(
        ",",
      )}]. Make sure you have write access to them.`,
    );
  }
}

export class CannotAddRecipeToCollectionsErrorInvalidVisibility extends BadRequestError {
  constructor(recipeId: string, invalidCollectionIds: string[]) {
    super(
      `Cannot add recipe with id ${recipeId} to collections: [${invalidCollectionIds.join(
        ",",
      )}]. Make sure the collection visibilities are valid for the recipe.`,
    );
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(username: string) {
    super(`User with username ${username} not found`);
  }
}

export class IngredientSectionsNotFoundError extends NotFoundError {
  constructor(missingIngredientSectionIds: string[]) {
    super(
      `Ingredient sections with ids ${missingIngredientSectionIds.join(
        ", ",
      )} not found`,
    );
  }
}

export class IngredientsNotFoundError extends NotFoundError {
  constructor(missingIngredientIds: string[]) {
    super(`Ingredients with ids ${missingIngredientIds.join(", ")} not found`);
  }
}

export class InstructionsNotFoundError extends NotFoundError {
  constructor(missingInstructionIds: string[]) {
    super(
      `Instructions with ids ${missingInstructionIds.join(", ")} not found`,
    );
  }
}
