import { handle, mapMethods } from "../../../utils/apiUtils";
import {
  createRecipeSchema,
  recipesPostHandler,
} from "../../../handlers/recipes/recipesPostHandler";

export default mapMethods({
  post: (req, res) =>
    handle({
      req,
      res,
      requireUser: true,
      bodyValidator: createRecipeSchema,
      handler: recipesPostHandler,
    }),
});
