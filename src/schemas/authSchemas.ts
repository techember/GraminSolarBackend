// schemas/authSchemas.ts
import { z } from "zod";

export const signupSchema = z.object({
  fullname: z.string(),
  gmail: z.string().email(),
  address: z.string(),
  consumerNumber:z.string(),
  panCard: z.string(),
  aadhaarNo: z.string(),
  phoneNo: z.string().max(10).min(10),
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

export const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});
