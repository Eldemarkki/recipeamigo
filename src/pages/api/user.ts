import { NextApiHandler } from "next";
import { getUserIdFromRequest } from "../../utils/auth";

const handler: NextApiHandler = async (req, res) => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({ userId });
};

export default handler;
