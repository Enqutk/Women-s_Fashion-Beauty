"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserOrders } from "@/features/order/services/order.api";
import type { Order } from "@/features/order/types";

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
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Order History</h1>
      <p style={{ marginTop: "0.5rem", color: "#555" }}>View all your placed orders.</p>

      {loading ? <p style={{ marginTop: "1rem" }}>Loading orders...</p> : null}
      {error ? <p style={{ marginTop: "1rem", color: "crimson" }}>{error}</p> : null}

      {!loading && orders.length === 0 ? (
        <div style={{ marginTop: "1rem" }}>
          <p>No orders yet.</p>
          <Link href="/products">Shop now</Link>
        </div>
      ) : null}

      <section style={{ marginTop: "1rem", display: "grid", gap: "0.9rem" }}>
        {orders.map((order) => (
          <article
            key={order.id}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "0.9rem" }}
          >
            <h2 style={{ fontSize: 18 }}>Order #{order.id}</h2>
            <p style={{ marginTop: "0.35rem" }}>
              Status: {order.status} | Total: ${order.total.toFixed(2)}
            </p>
            <p style={{ marginTop: "0.35rem", color: "#666" }}>
              Placed: {new Date(order.createdAt).toLocaleString()}
            </p>
            <ul style={{ marginTop: "0.55rem", paddingLeft: "1.2rem" }}>
              {order.items.map((item) => (
                <li key={`${order.id}-${item.productId}`}>
                  {item.productName} - {item.quantity} x ${item.unitPrice.toFixed(2)} = $
                  {item.lineTotal.toFixed(2)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
