import { NextApiRequest, NextApiResponse } from "next";
import { getRequestSession } from "@/lib/auth";
import { getSerializedPlantForUser } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getRequestSession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const plant = await getSerializedPlantForUser(session.sub);
  if (!plant) {
    return res.status(404).json({ error: "Plant not found." });
  }

  return res.status(200).json({ plant });
}
