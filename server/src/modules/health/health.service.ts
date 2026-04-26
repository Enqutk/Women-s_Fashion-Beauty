import type { HealthStatusResponse } from "./health.model";
import { getDatabaseTime } from "./health.repository";

export async function getHealthStatus(): Promise<HealthStatusResponse> {
  const serverTime = await getDatabaseTime();

  return {
    ok: true,
    message: "Backend is running and connected to PostgreSQL",
    serverTime,
  };
}
