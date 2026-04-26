import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { createUser, findUserByEmail } from "../user/user.repository";
import { toPublicUser } from "../user/user.service";
import type { AuthPayload, LoginInput, RegisterInput } from "./auth.model";

type JwtClaims = {
  sub: string;
  email: string;
  role: "admin" | "user";
};

function buildToken(claims: JwtClaims): string {
  return jwt.sign(claims, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await createUser({
    ...input,
    password: hashedPassword,
  });

  const token = buildToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = buildToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: toPublicUser(user),
  };
}
