import {
  createRecipeSchema,
  recipesPostHandler,
} from "../../../handlers/recipes/recipesPostHandler";
import { handle, mapMethods } from "../../../utils/apiUtils";

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
