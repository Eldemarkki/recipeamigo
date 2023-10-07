import { collectionsPostHandler } from "../../../handlers/collections/collectionsPostHandler";
import { mapMethods } from "../../../utils/apiUtils";

export default mapMethods({
  post: collectionsPostHandler,
});
