import { recipePostAddToCollectionsHandler } from "../../../../../handlers/recipes/addToCollections/recipePostAddToCollectionsHandler";
import { handle, mapMethods } from "../../../../../utils/apiUtils";

export default mapMethods({
  post: async (req, res) =>
    handle({
      res,
      req,
      ...recipePostAddToCollectionsHandler,
    }),
});
