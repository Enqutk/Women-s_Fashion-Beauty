import type { PublicUser, UserRole } from "../user";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthPayload = {
  token: string;
  user: PublicUser;
};
