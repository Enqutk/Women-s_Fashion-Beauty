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

  const completionRate = useMemo(() => {
    const completedCount =
      analytics.orderStatusBreakdown.find((entry) => entry.status === "completed")?.count ?? 0;
    if (analytics.totalOrders <= 0) {
      return "0%";
    }
    return `${Math.round((completedCount / analytics.totalOrders) * 100)}%`;
  }, [analytics.orderStatusBreakdown, analytics.totalOrders]);

  return (
    <AdminShell title="Dashboard Overview">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1 className={styles.title}>Dashboard Overview</h1>
            <p className={styles.muted}>
              Snapshot of users, sales activity, and product inventory health.
            </p>
          </div>
          <div className={styles.badge}>Completion Rate: {completionRate}</div>
        </header>

        {loading ? <p className={styles.alert}>Loading dashboard...</p> : null}
        {error ? <p className={`${styles.alert} ${styles.error}`}>{error}</p> : null}

        <section className={styles.kpiGrid}>
          <article className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Total Users</p>
            <p className={styles.kpiValue}>{analytics.totalUsers}</p>
          </article>

          <article className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Total Orders</p>
            <p className={styles.kpiValue}>{analytics.totalOrders}</p>
          </article>

          <article className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Total Products</p>
            <p className={styles.kpiValue}>{analytics.totalProducts}</p>
          </article>
        </section>

        <section className={`${styles.section} ${styles.chartCard}`}>
          <h2 className={styles.sectionHeading}>Order Status Distribution</h2>
          <p className={styles.muted}>Track fulfillment flow at a glance.</p>
          <div className={styles.list}>
            {analytics.orderStatusBreakdown.map((entry) => {
              const width = `${Math.max((entry.count / maxStatusCount) * 100, entry.count > 0 ? 8 : 0)}%`;
              const barClassName =
                entry.status === "completed"
                  ? styles.barCompleted
                  : entry.status === "cancelled"
                    ? styles.barCancelled
                    : styles.barPending;
              return (
                <div key={entry.status} className={styles.chartRow}>
                  <span className={styles.statusLabel}>{entry.status}</span>
                  <div className={styles.barTrack}>
                    <div className={`${styles.bar} ${barClassName}`} style={{ width }} />
                  </div>
                  <strong className={styles.statusCount}>{entry.count}</strong>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AdminShell>
  );
}
