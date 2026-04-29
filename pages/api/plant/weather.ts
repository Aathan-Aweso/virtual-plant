import { NextApiRequest, NextApiResponse } from "next";
import { getRequestSession } from "@/lib/auth";
import { updateUserPlantWeather } from "@/lib/db";
import { weatherSchema } from "@/lib/validators";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getRequestSession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const parsed = weatherSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid weather value." });
  }

  const plant = await updateUserPlantWeather(session.sub, parsed.data.weather);
  if (!plant) {
    return res.status(404).json({ error: "Plant not found." });
  }

  return res.status(200).json({ plant });
}
