import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type JwtPayload = {
  sub: string;
  email: string;
  role: "admin" | "user";
};

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({
      ok: false,
      message: "Missing authentication token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.authUser = {
      id: Number(decoded.sub),
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (_error) {
    res.status(401).json({
      ok: false,
      message: "Invalid or expired token",
    });
  }
}

export function requireRole(role: "admin" | "user") {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }

    if (req.authUser.role !== role) {
      res.status(403).json({
        ok: false,
        message: "Forbidden: insufficient permissions",
      });
      return;
    }

    next();
  };
}
