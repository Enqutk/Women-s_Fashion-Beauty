import type { Order } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "auth_token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
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
