import type { CartResponse } from "../types";
import { getAuthToken } from "@/features/auth/utils/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function parseResponse(response: Response): Promise<CartResponse> {
  const payload = (await response.json()) as CartResponse & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Cart request failed");
  }
  return payload;
}

export async function fetchCart(): Promise<CartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseResponse(response);
}

export async function addToCart(productId: number, quantity = 1): Promise<CartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  return parseResponse(response);
}

export async function updateCartQuantity(
  productId: number,
  quantity: number,
): Promise<CartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  return parseResponse(response);
}

export async function removeCartItem(productId: number): Promise<CartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseResponse(response);
}
