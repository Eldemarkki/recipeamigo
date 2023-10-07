import { postLikeHandler } from "../../../../../handlers/recipes/likes/postLikeHandler";
import { mapMethods } from "../../../../../utils/apiUtils";

export default mapMethods({
  post: postLikeHandler,
});
