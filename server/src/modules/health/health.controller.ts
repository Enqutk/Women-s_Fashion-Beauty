import { Request, Response } from "express";
import { getHealthStatus } from "./health.service";
import { validateHealthRequest } from "./health.validation";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  try {
    validateHealthRequest();
    const payload = await getHealthStatus();
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Backend is running but database is not reachable",
      serverTime: null,
      error: error instanceof Error ? error.message : "Unknown database error",
    });
  }
}
