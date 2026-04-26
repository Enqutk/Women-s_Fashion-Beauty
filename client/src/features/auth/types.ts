export type UserRole = "admin" | "user";

export type AuthUser = {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
