"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCart } from "@/features/cart/services/cart.api";
import type { CartResponse } from "@/features/cart/types";
import { placeOrder } from "@/features/order/services/order.api";
import styles from "./checkout.module.css";

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
    <main className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      <p className={styles.subtitle}>Review your cart and place your order.</p>

      {loading ? <p className={styles.state}>Loading cart...</p> : null}
      {message ? <p className={styles.success}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && cart.items.length === 0 ? (
        <div className={styles.empty}>
          <p>Your cart is empty.</p>
          <Link href="/products" className={styles.browseLink}>
            Browse products
          </Link>
        </div>
      ) : null}

      {cart.items.length > 0 ? (
        <section className={styles.layout}>
          <section className={styles.itemsWrap}>
            <h2 className={styles.itemsHeader}>Your Items</h2>
            {cart.items.map((item) => (
              <article key={item.productId} className={styles.item}>
                <div>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemMeta}>
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <p className={styles.itemTotal}>${item.lineTotal.toFixed(2)}</p>
              </article>
            ))}
          </section>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.row}>
              <span className={styles.label}>Subtotal</span>
              <span className={styles.value}>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Shipping</span>
              <span>calculated</span>
            </div>
            <div className={styles.total}>
              <span>Total</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <button type="button" className={styles.placeOrderBtn} onClick={onPlaceOrder}>
              Place Order
            </button>
            <Link href="/orders" className={styles.secondaryLink}>
              View order history
            </Link>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
