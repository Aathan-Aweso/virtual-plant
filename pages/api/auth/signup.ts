import { NextApiRequest, NextApiResponse } from "next";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { registerUser } from "@/lib/db";
import { authSchema } from "@/lib/validators";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid email and a password with at least 8 characters." });
  }

  const { email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const { user } = await registerUser(email, passwordHash);
    const token = await createSessionToken(user);
    await setSessionCookie(res, token);
    return res.status(201).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    return res.status(500).json({ error: "Unable to create account." });
  }
}