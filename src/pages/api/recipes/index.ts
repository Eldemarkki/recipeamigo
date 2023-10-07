import { recipesPostHandler } from "../../../handlers/recipes/recipesPostHandler";
import { mapMethods } from "../../../utils/apiUtils";

export default mapMethods({
  post: recipesPostHandler,
});
