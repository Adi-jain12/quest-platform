import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),

  email: z.email().max(254),

  password: z
    .string()
    .min(8)
    .refine(
      (password) => Buffer.byteLength(password, "utf8") <= 72,
      "Password must not exceed 72 bytes"
    ),
});


export const loginSchema = z.object({
  email: z.email().max(254),

  password: z
    .string()
    .min(1)
    .refine(
      (password) => Buffer.byteLength(password, "utf8") <= 72,
      "Invalid credentials"
    ),
});