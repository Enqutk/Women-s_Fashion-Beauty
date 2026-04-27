"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { fetchDashboardAnalytics } from "@/features/analytics/services/analytics.api";
import type { DashboardAnalytics } from "@/features/analytics/types";
import styles from "../admin.module.css";

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
    <AdminShell title="Dashboard Overview">
      <main className={styles.page}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      <p className={styles.muted}>
        Overview of key platform metrics for users, orders, and products.
      </p>

      {loading ? <p className={styles.alert}>Loading dashboard...</p> : null}
      {error ? <p className={`${styles.alert} ${styles.error}`}>{error}</p> : null}

      <section className={styles.kpiGrid}>
        <article className={styles.card}>
          <p className={styles.muted}>Total Users</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{analytics.totalUsers}</p>
        </article>

        <article className={styles.card}>
          <p className={styles.muted}>Total Orders</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{analytics.totalOrders}</p>
        </article>

        <article className={styles.card}>
          <p className={styles.muted}>Total Products</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{analytics.totalProducts}</p>
        </article>
      </section>

      <section className={`${styles.section} ${styles.card}`}>
        <h2 style={{ fontSize: 20 }}>Order Status Chart</h2>
        <p className={styles.muted}>
          Simple status distribution to track fulfillment progress.
        </p>
        <div className={styles.list}>
          {analytics.orderStatusBreakdown.map((entry) => {
            const width = `${Math.max((entry.count / maxStatusCount) * 100, entry.count > 0 ? 8 : 0)}%`;
            return (
              <div key={entry.status} className={styles.chartRow}>
                <span style={{ textTransform: "capitalize" }}>{entry.status}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.bar}
                    style={{
                      width,
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
    </AdminShell>
  );
}
