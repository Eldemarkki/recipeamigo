import { postLikeHandler } from "../../../../../handlers/recipes/likes/postLikeHandler";
import { handle, mapMethods } from "../../../../../utils/apiUtils";

export default mapMethods({
  post: (req, res) =>
    handle({
      req,
      res,
      ...postLikeHandler,
    }),
});
