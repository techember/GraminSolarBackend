import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(3),
  address: z.string().min(5),
  aadhaarNo: z.string().length(12),
  panCard: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
