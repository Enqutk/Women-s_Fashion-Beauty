"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserOrders } from "@/features/order/services/order.api";
import type { Order } from "@/features/order/types";
import styles from "./orders.module.css";

function statusClass(status: string): string {
  if (status === "completed") {
    return `${styles.status} ${styles.completed}`;
  }
  if (status === "cancelled") {
    return `${styles.status} ${styles.cancelled}`;
  }
  return `${styles.status} ${styles.pending}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders(): Promise<void> {
      try {
        const payload = await fetchUserOrders();
        setOrders(payload);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders().catch(() => {});
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Order History</h1>
      <p className={styles.subtitle}>View all your placed orders.</p>

      {loading ? <p className={styles.state}>Loading orders...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && orders.length === 0 ? (
        <div className={styles.empty}>
          <p>No orders yet.</p>
          <Link href="/products" className={styles.shopLink}>
            Shop now
          </Link>
        </div>
      ) : null}

      <section className={styles.list}>
        {orders.map((order) => (
          <article key={order.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.orderId}>Order #{order.id}</p>
              <span className={statusClass(order.status)}>{order.status}</span>
            </div>
            <div className={styles.items}>
              <p className={styles.meta}>Placed: {new Date(order.createdAt).toLocaleString()}</p>
              <p className={styles.meta}>Total: ${order.total.toFixed(2)}</p>
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`} className={styles.itemRow}>
                  <span className={styles.itemName}>
                    {item.productName} x {item.quantity}
                  </span>
                  <span className={styles.itemValue}>${item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
