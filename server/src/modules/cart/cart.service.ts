import { getProductByIdService } from "../product/product.service";
import {
  getCartItemsByUserId,
  removeCartItem,
  updateCartItem,
  upsertCartItem,
} from "./cart.repository";
import type { AddCartItemInput, CartResponse, UpdateCartItemInput } from "./cart.model";

function summarizeCart(items: CartResponse["items"]): CartResponse {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  return { items, totalItems, subtotal };
}

export async function getCartByUserId(userId: number): Promise<CartResponse> {
  const items = await getCartItemsByUserId(userId);
  return summarizeCart(items);
}

export async function addCartItem(userId: number, input: AddCartItemInput): Promise<CartResponse> {
  const product = await getProductByIdService(input.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  await upsertCartItem(userId, input);
  return getCartByUserId(userId);
}

export async function changeCartItemQuantity(
  userId: number,
  productId: number,
  input: UpdateCartItemInput,
): Promise<CartResponse> {
  const updated = await updateCartItem(userId, productId, input);
  if (!updated) {
    throw new Error("Cart item not found");
  }
  return getCartByUserId(userId);
}

export async function deleteCartItem(userId: number, productId: number): Promise<CartResponse> {
  const removed = await removeCartItem(userId, productId);
  if (!removed) {
    throw new Error("Cart item not found");
  }
  return getCartByUserId(userId);
}
