"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCart } from "@/features/cart/services/cart.api";
import type { CartResponse } from "@/features/cart/types";
import { placeOrder } from "@/features/order/services/order.api";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartResponse>({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadCart(): Promise<void> {
    try {
      const payload = await fetchCart();
      setCart(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart().catch(() => {});
  }, []);

  async function onPlaceOrder(): Promise<void> {
    try {
      setError(null);
      setMessage(null);
      const order = await placeOrder();
      setMessage(`Order #${order.id} placed successfully.`);
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      window.dispatchEvent(new Event("cart:changed"));
    } catch (placeError) {
      setError(placeError instanceof Error ? placeError.message : "Failed to place order");
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Checkout</h1>
      <p style={{ marginTop: "0.5rem", color: "#555" }}>
        Review your cart and place your order.
      </p>

      {loading ? <p style={{ marginTop: "1rem" }}>Loading cart...</p> : null}
      {message ? <p style={{ marginTop: "1rem", color: "green" }}>{message}</p> : null}
      {error ? <p style={{ marginTop: "1rem", color: "crimson" }}>{error}</p> : null}

      {!loading && cart.items.length === 0 ? (
        <div style={{ marginTop: "1rem" }}>
          <p>Your cart is empty.</p>
          <Link href="/products">Browse products</Link>
        </div>
      ) : null}

      {cart.items.length > 0 ? (
        <section style={{ marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
          {cart.items.map((item) => (
            <article
              key={item.productId}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "0.8rem" }}
            >
              <h3>{item.name}</h3>
              <p>
                ${item.price.toFixed(2)} x {item.quantity} = ${item.lineTotal.toFixed(2)}
              </p>
            </article>
          ))}
          <p style={{ marginTop: "0.5rem", fontWeight: 700 }}>
            Subtotal: ${cart.subtotal.toFixed(2)}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <button type="button" onClick={onPlaceOrder}>
              Place order
            </button>
            <Link href="/orders">View order history</Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
