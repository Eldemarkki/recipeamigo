import { prisma } from "../../../db";
import {
  profilePutHandler,
  profileSchema,
} from "../../../handlers/profile/profilePutHandler";
import { handle, mapMethods } from "../../../utils/apiUtils";
import { getUserFromRequest } from "../../../utils/auth";

const handler = mapMethods({
  post: async (req, res) => {
    const body = profileSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error });
      return;
    }

    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (user.status === "OK") {
      res.status(409).json({ message: "Profile already exists" });
      return;
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        username: body.data.name,
      },
    });

    if (existingProfile) {
      res.status(409).json({ message: "Username already taken" });
      return;
    }

    const profile = await prisma.userProfile.create({
      data: {
        clerkId: user.userId,
        username: body.data.name,
      },
    });

    res.status(200).json(profile);
    return;
  },
  put: (req, res) =>
    handle({
      req,
      res,
      ...profilePutHandler,
    }),
});

export default handler;
