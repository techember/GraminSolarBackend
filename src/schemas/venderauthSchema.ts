import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(1),
  address: z.string().min(1),
  aadhaarNo: z.string().length(12),
  panCard: z.string().length(10),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNo: z.string().length(10),

  // ✅ allow extra field
  registrationFee: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
