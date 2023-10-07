import { recipePostAddToCollectionsHandler } from "../../../../../handlers/recipes/addToCollections/recipePostAddToCollectionsHandler";
import { mapMethods } from "../../../../../utils/apiUtils";

export default mapMethods({
  post: recipePostAddToCollectionsHandler,
});
