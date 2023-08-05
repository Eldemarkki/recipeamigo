import { recipesPutHandler } from "../../../../handlers/recipes/recipePutHandler";
import { handle, mapMethods } from "../../../../utils/apiUtils";

export default mapMethods({
  put: (req, res) =>
    handle({
      req,
      res,
      ...recipesPutHandler,
    }),
});
