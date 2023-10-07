import { postUnlikeHandler } from "../../../../../handlers/recipes/likes/postUnlikeHandler";
import { mapMethods } from "../../../../../utils/apiUtils";

export default mapMethods({
  post: postUnlikeHandler,
});
