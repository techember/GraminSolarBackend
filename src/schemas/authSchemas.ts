// schemas/authSchemas.ts
import { z } from "zod";

export const signupSchema = z.object({
  fullname: z.string(),
  address: z.string(),
  phoneNo: z.number().max(9999999999).min(10000000000),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters"),
});
