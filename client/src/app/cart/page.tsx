"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchCart,
  removeCartItem,
  updateCartQuantity,
} from "@/features/cart/services/cart.api";
import type { CartResponse } from "@/features/cart/types";

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse>({ items: [], subtotal: 0, totalItems: 0 });
  const [error, setError] = useState<string | null>(null);

  async function loadCart(): Promise<void> {
    try {
      const nextCart = await fetchCart();
      setCart(nextCart);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load cart");
    }
  }

  useEffect(() => {
    loadCart().catch(() => {});
  }, []);

  async function onQuantityChange(productId: number, quantity: number): Promise<void> {
    try {
      const nextCart = await updateCartQuantity(productId, quantity);
      setCart(nextCart);
      window.dispatchEvent(new Event("cart:changed"));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update item");
    }
  }

  async function onRemove(productId: number): Promise<void> {
    try {
      const nextCart = await removeCartItem(productId);
      setCart(nextCart);
      window.dispatchEvent(new Event("cart:changed"));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to remove item");
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Your Cart</h1>
      <p style={{ marginTop: "0.5rem", color: "#555" }}>Total items: {cart.totalItems}</p>
      <p style={{ marginTop: "0.2rem", fontWeight: 700 }}>Subtotal: ${cart.subtotal.toFixed(2)}</p>
      <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.8rem" }}>
        <Link href="/checkout">Go to checkout</Link>
        <Link href="/orders">Order history</Link>
      </div>

      {error ? <p style={{ marginTop: "0.8rem", color: "crimson" }}>{error}</p> : null}

      {cart.items.length === 0 ? (
        <p style={{ marginTop: "1.2rem" }}>Your cart is empty.</p>
      ) : (
        <section style={{ marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
          {cart.items.map((item) => (
            <article
              key={item.productId}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "0.8rem" }}
            >
              <h3>{item.name}</h3>
              <p style={{ marginTop: "0.35rem" }}>
                ${item.price.toFixed(2)} x {item.quantity} = ${item.lineTotal.toFixed(2)}
              </p>
              <div style={{ marginTop: "0.55rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => onQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                >
                  +
                </button>
                <button type="button" onClick={() => onRemove(item.productId)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
