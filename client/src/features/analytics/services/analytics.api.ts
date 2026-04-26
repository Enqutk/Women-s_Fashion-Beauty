import type { DashboardAnalytics } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "auth_token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  const payload = (await response.json()) as DashboardAnalytics & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Failed to fetch dashboard analytics");
  }
  return payload;
}
