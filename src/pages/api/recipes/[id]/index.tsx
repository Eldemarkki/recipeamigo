import { recipesDeleteHandler } from "../../../../handlers/recipes/recipeDeleteHandler";
import { recipesPutHandler } from "../../../../handlers/recipes/recipePutHandler";
import { mapMethods } from "../../../../utils/apiUtils";

export default mapMethods({
  put: recipesPutHandler,
  delete: recipesDeleteHandler,
});
