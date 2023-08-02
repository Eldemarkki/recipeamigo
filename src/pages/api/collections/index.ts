import {
  collectionsPostHandler,
  createCollectionSchema,
} from "../../../handlers/collections/collectionsPostHandler";
import { handle, mapMethods } from "../../../utils/apiUtils";

export default mapMethods({
  post: (req, res) =>
    handle({
      req,
      res,
      requireUser: true,
      bodyValidator: createCollectionSchema,
      handler: collectionsPostHandler,
    }),
});
