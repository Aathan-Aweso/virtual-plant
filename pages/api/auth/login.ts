import { NextApiRequest, NextApiResponse } from "next";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { authSchema } from "@/lib/validators";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid credentials." });
  }

  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = await createSessionToken(user);
  await setSessionCookie(res, token);

  return res.status(200).json({ ok: true });
}