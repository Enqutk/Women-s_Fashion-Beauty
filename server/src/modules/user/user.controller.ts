import { Request, Response } from "express";
import { userRepository } from ".";
import { toPublicUser } from "./user.service";

export async function listUsersAdmin(_req: Request, res: Response): Promise<void> {
  const users = await userRepository.listUsers();
  res.json(users.map(toPublicUser));
}
