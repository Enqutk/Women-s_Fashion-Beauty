import { getAuthToken } from "@/features/auth/utils/auth-storage";
import type { AdminUser } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "User request failed");
  }
  return payload;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseResponse<AdminUser[]>(response);
}
