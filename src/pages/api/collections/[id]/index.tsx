import { collectionsIdDeleteHandler } from "../../../../handlers/collections/collectionsIdDeleteHandler";
import { collectionsIdPutHandler } from "../../../../handlers/collections/collectionsIdPutHandler";
import { mapMethods } from "../../../../utils/apiUtils";

export default mapMethods({
  put: collectionsIdPutHandler,
  delete: collectionsIdDeleteHandler,
});
