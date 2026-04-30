"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchCart,
  removeCartItem,
  updateCartQuantity,
} from "@/features/cart/services/cart.api";
import type { CartResponse } from "@/features/cart/types";
import styles from "./cart.module.css";

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse>({ items: [], subtotal: 0, totalItems: 0 });
  const [error, setError] = useState<string | null>(null);
  const discount = cart.items.some((item) => item.name.toLowerCase().includes("elixir")) ? cart.subtotal * 0.5 : 0;
  const finalTotal = Math.max(0, cart.subtotal - discount);

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
    <main className={styles.page}>
      <h1 className={styles.title}>My Cart</h1>

      {error ? <p className={styles.error}>{error}</p> : null}

      {cart.items.length === 0 ? (
        <p className={styles.empty}>Your cart is empty.</p>
      ) : (
        <section className={styles.layout}>
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <span>Product</span>
              <span>SKU</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            {cart.items.map((item, idx) => (
              <article className={styles.row} key={item.productId}>
                <div className={styles.productCell}>
                  <img
                    src={item.imageUrl ?? "https://via.placeholder.com/128x96?text=Item"}
                    alt={item.name}
                    className={styles.thumb}
                  />
                  <p className={styles.name}>{item.name}</p>
                </div>
                <span className={styles.sku}>SKU{String(item.productId).padStart(3, "0")}</span>
                <span className={styles.price}>${item.price.toFixed(2)}</span>
                <div className={styles.qtyControl}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => onQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div>
                  <div className={styles.lineTotal}>${item.lineTotal.toFixed(2)}</div>
                  {idx === 2 ? <span className={styles.saleOff}>50% OFF</span> : null}
                  <button type="button" className={styles.removeBtn} onClick={() => onRemove(item.productId)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Subtotal</span>
              <span className={styles.summaryValue}>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Shipping</span>
              <span className={styles.muted}>calculated</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Discount</span>
              <span className={styles.summaryValue}>-${discount.toFixed(2)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            <h3 className={styles.promoTitle}>Promo Code</h3>
            <input className={styles.promoInput} placeholder="Promo code" />
            <Link href="/checkout" className={styles.checkoutBtn}>
              Proceed To Checkout
            </Link>
            <Link href="/orders" className={styles.orderHistoryLink}>
              Order history
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}
