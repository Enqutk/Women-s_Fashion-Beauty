import { z } from "zod";
import type { LoginInput, RegisterInput } from "./auth.model";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(6).max(72),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1),
  })
  .strict();

export function validateRegisterInput(input: unknown): RegisterInput {
  return registerSchema.parse(input);
}

export function validateLoginInput(input: unknown): LoginInput {
  return loginSchema.parse(input);
}
