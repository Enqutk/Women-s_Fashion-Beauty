"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/features/order/types";
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from "@/features/order/services/order.api";

const statusOptions = ["pending", "completed", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadOrders(): Promise<void> {
    try {
      const payload = await fetchAllOrdersAdmin();
      setOrders(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders().catch(() => {});
  }, []);

  async function onUpdateStatus(orderId: number, status: "pending" | "completed" | "cancelled") {
    try {
      setError(null);
      setMessage(null);
      const updated = await updateOrderStatusAdmin(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
      setMessage(`Order #${orderId} updated to ${status}`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update order");
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Admin Orders Dashboard</h1>
      <p style={{ marginTop: "0.5rem", color: "#555" }}>View all orders and update order status.</p>

      {loading ? <p style={{ marginTop: "1rem" }}>Loading orders...</p> : null}
      {message ? <p style={{ marginTop: "1rem", color: "green" }}>{message}</p> : null}
      {error ? <p style={{ marginTop: "1rem", color: "crimson" }}>{error}</p> : null}

      <section style={{ marginTop: "1rem", display: "grid", gap: "0.9rem" }}>
        {orders.map((order) => (
          <article key={order.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "0.9rem" }}>
            <h2 style={{ fontSize: 18 }}>Order #{order.id}</h2>
            <p style={{ marginTop: "0.3rem" }}>
              User: {order.userId} | Total: ${order.total.toFixed(2)}
            </p>
            <p style={{ marginTop: "0.3rem", color: "#666" }}>
              Created: {new Date(order.createdAt).toLocaleString()}
            </p>

            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span>Status:</span>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateStatus(order.id, status)}
                  disabled={order.status === status}
                >
                  {status}
                </button>
              ))}
            </div>

            <ul style={{ marginTop: "0.6rem", paddingLeft: "1.2rem" }}>
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
