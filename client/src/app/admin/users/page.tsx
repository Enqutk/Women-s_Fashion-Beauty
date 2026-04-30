"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { fetchAdminUsers } from "@/features/user/services/user.api";
import type { AdminUser } from "@/features/user/types";
import styles from "../admin.module.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers(): Promise<void> {
      try {
        const payload = await fetchAdminUsers();
        setUsers(payload);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers().catch(() => {});
  }, []);

  return (
    <AdminShell title="Users">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1 className={styles.title}>Users</h1>
            <p className={styles.muted}>
              Manage account access, role assignments, and user support workflows.
            </p>
          </div>
        </header>

        <section className={styles.card}>
          <h2 className={styles.sectionHeading}>User Directory</h2>
          <p className={styles.muted}>View registered accounts and access levels.</p>

          {loading ? <p className={styles.alert}>Loading users...</p> : null}
          {error ? <p className={`${styles.alert} ${styles.error}`}>{error}</p> : null}

          {!loading && !error ? (
            users.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`${styles.roleBadge} ${
                              user.role === "admin" ? styles.roleAdmin : styles.roleUser
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.emptyCategoryText}>No users found yet.</p>
            )
          ) : null}
        </section>
      </main>
    </AdminShell>
  );
}
