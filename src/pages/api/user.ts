import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../utils/auth";

const handler: NextApiHandler = async (req, res) => {
  const user = getUserFromRequest(req);

  return res.json(user);
};

export default handler;
