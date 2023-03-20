import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../utils/auth";

const handler: NextApiHandler = async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json(user);
};

export default handler;
