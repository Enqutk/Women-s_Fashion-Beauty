import { Request, Response } from "express";
import { getDashboardAnalytics } from "./analytics.service";

export async function getDashboardAnalyticsController(
  _req: Request,
  res: Response,
): Promise<void> {
  const analytics = await getDashboardAnalytics();
  res.json(analytics);
}
