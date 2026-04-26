"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDashboardAnalytics } from "@/features/analytics/services/analytics.api";
import type { DashboardAnalytics } from "@/features/analytics/types";

const fallbackAnalytics: DashboardAnalytics = {
  totalUsers: 0,
  totalOrders: 0,
  totalProducts: 0,
  orderStatusBreakdown: [
    { status: "pending", count: 0 },
    { status: "completed", count: 0 },
    { status: "cancelled", count: 0 },
  ],
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>(fallbackAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics(): Promise<void> {
      try {
        const payload = await fetchDashboardAnalytics();
        setAnalytics(payload);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics().catch(() => {});
  }, []);

  const maxStatusCount = useMemo(
    () => Math.max(...analytics.orderStatusBreakdown.map((entry) => entry.count), 1),
    [analytics.orderStatusBreakdown],
  );

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ marginTop: "0.45rem", color: "#555" }}>
        Overview of key platform metrics for users, orders, and products.
      </p>

      {loading ? <p style={{ marginTop: "1rem" }}>Loading dashboard...</p> : null}
      {error ? <p style={{ marginTop: "1rem", color: "crimson" }}>{error}</p> : null}

      <section
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.8rem",
        }}
      >
        <article style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
          <p style={{ color: "#666" }}>Total Users</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginTop: "0.3rem" }}>{analytics.totalUsers}</p>
        </article>

        <article style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
          <p style={{ color: "#666" }}>Total Orders</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginTop: "0.3rem" }}>{analytics.totalOrders}</p>
        </article>

        <article style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
          <p style={{ color: "#666" }}>Total Products</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginTop: "0.3rem" }}>
            {analytics.totalProducts}
          </p>
        </article>
      </section>

      <section style={{ marginTop: "1rem", border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
        <h2 style={{ fontSize: 20 }}>Order Status Chart</h2>
        <p style={{ marginTop: "0.3rem", color: "#666" }}>
          Simple status distribution to track fulfillment progress.
        </p>
        <div style={{ marginTop: "0.8rem", display: "grid", gap: "0.55rem" }}>
          {analytics.orderStatusBreakdown.map((entry) => {
            const width = `${Math.max((entry.count / maxStatusCount) * 100, entry.count > 0 ? 8 : 0)}%`;
            return (
              <div key={entry.status} style={{ display: "grid", gridTemplateColumns: "130px 1fr 70px", gap: "0.6rem", alignItems: "center" }}>
                <span style={{ textTransform: "capitalize" }}>{entry.status}</span>
                <div style={{ background: "#efefef", height: 12, borderRadius: 999 }}>
                  <div
                    style={{
                      width,
                      height: "100%",
                      borderRadius: 999,
                      background:
                        entry.status === "completed"
                          ? "#22c55e"
                          : entry.status === "cancelled"
                            ? "#ef4444"
                            : "#3b82f6",
                    }}
                  />
                </div>
                <strong>{entry.count}</strong>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
