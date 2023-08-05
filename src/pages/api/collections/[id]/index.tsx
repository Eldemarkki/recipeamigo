import { collectionsIdPutHandler } from "../../../../handlers/collections/collectionsIdPutHandler";
import { handle, mapMethods } from "../../../../utils/apiUtils";

export default mapMethods({
  put: (req, res) =>
    handle({
      req,
      res,
      ...collectionsIdPutHandler,
    }),
});
