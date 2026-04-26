export type UserRole = "admin" | "user";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "password">;

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};
