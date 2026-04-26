import { z } from "zod";
import type { LoginInput, RegisterInput } from "./auth.model";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["admin", "user"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export function validateRegisterInput(input: unknown): RegisterInput {
  const parsed = registerSchema.parse(input);
  return {
    ...parsed,
    role: parsed.role ?? "user",
  };
}

export function validateLoginInput(input: unknown): LoginInput {
  return loginSchema.parse(input);
}
