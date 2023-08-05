export type HttpStatusCode = 400 | 401 | 403 | 404 | 409 | 500;

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

export class RecipeNotFoundError extends NotFoundError {
  constructor(recipeId: string) {
    super(`Recipe with id ${recipeId} not found`);
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

export class RecipeAlreadyLiked extends BadRequestError {
  constructor(recipeId: string) {
    super(`Recipe with id ${recipeId} already liked`);
  }
}

export class RecipeAlreadyUnliked extends BadRequestError {
  constructor(recipeId: string) {
    super(`Recipe with id ${recipeId} already unliked`);
  }
}

export class CannotLikeOwnRecipe extends BadRequestError {
  constructor() {
    super("Cannot like own recipe");
  }
}

export class CannotUnlikeOwnRecipe extends BadRequestError {
  constructor() {
    super("Cannot unlike own recipe");
  }
}
