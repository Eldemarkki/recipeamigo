import { prisma } from "../../../db";
import { getUserFromRequest } from "../../../utils/auth";
import { NextApiHandler } from "next";
import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
});

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "POST") {
    const body = profileSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error });
    }

    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (user.status === "OK") {
      return res.status(409).json({ message: "Profile already exists" });
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        username: body.data.name,
      },
    });

    if (existingProfile) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const profile = await prisma.userProfile.create({
      data: {
        clerkId: user.userId,
        username: body.data.name,
      },
    });

    return res.status(200).json(profile);
  }
};

export default handler;
