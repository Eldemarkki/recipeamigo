import { profilePostHandler } from "../../../handlers/profile/profilePostHandler";
import { profilePutHandler } from "../../../handlers/profile/profilePutHandler";
import { handle, mapMethods } from "../../../utils/apiUtils";

const handler = mapMethods({
  post: (req, res) => handle({ req, res, ...profilePostHandler }),
  put: (req, res) => handle({ req, res, ...profilePutHandler }),
});

export default handler;
