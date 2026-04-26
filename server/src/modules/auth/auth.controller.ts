import { Request, Response } from "express";
import { login, register } from "./auth.service";
import { validateLoginInput, validateRegisterInput } from "./auth.validation";

export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const payload = validateRegisterInput(req.body);
    const result = await register(payload);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    const status = message.includes("already registered") ? 409 : 400;
    res.status(status).json({
      ok: false,
      message,
    });
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const payload = validateLoginInput(req.body);
    const result = await login(payload);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = message.includes("Invalid email or password") ? 401 : 400;
    res.status(status).json({
      ok: false,
      message,
    });
  }
}

export function getCurrentUser(req: Request, res: Response): void {
  if (!req.authUser) {
    res.status(401).json({
      ok: false,
      message: "Unauthorized",
    });
    return;
  }

  res.json({
    ok: true,
    user: req.authUser,
  });
}

export function getAdminOnlyStatus(req: Request, res: Response): void {
  res.json({
    ok: true,
    message: "Admin access granted",
    user: req.authUser ?? null,
  });
}
