import { profilePostHandler } from "../../../handlers/profile/profilePostHandler";
import { profilePutHandler } from "../../../handlers/profile/profilePutHandler";
import { mapMethods } from "../../../utils/apiUtils";

const handler = mapMethods({
  post: profilePostHandler,
  put: profilePutHandler,
});

export default handler;
