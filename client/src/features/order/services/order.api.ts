import type { Order } from "../types";
import { getAuthToken } from "@/features/auth/utils/auth-storage";

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
    throw new Error(payload.message ?? "Order request failed");
  }
  return payload;
}

export async function placeOrder(): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseResponse<Order>(response);
}

export async function fetchUserOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseResponse<Order[]>(response);
}

export async function fetchAllOrdersAdmin(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders/admin`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseResponse<Order[]>(response);
}

export async function updateOrderStatusAdmin(
  orderId: number,
  status: "pending" | "completed" | "cancelled",
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return parseResponse<Order>(response);
}
