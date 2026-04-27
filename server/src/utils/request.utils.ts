import { Request } from "express";

export function getAuthUserId(req: Request): number | null {
  return req.authUser?.id ?? null;
}

export function parsePositiveIntParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}
