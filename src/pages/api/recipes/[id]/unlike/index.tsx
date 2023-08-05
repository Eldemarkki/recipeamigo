import { postUnlikeHandler } from "../../../../../handlers/recipes/likes/postUnlikeHandler";
import { handle, mapMethods } from "../../../../../utils/apiUtils";

export default mapMethods({
  post: (req, res) =>
    handle({
      req,
      res,
      ...postUnlikeHandler,
    }),
});
