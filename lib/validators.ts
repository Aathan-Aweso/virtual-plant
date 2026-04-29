import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
});

export const weatherSchema = z.object({
  weather: z.enum(["sunny", "rainy", "cloudy"]),
});
