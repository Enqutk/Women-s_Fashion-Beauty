"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./AdminShell.module.css";

type AdminShellProps = {
  title: string;
  children: ReactNode;
};

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminShell({ title, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <section className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Mintech Solution.</div>
        <nav className={styles.menu}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.menuLink} ${isActive ? styles.menuActive : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className={styles.menuLink}>Users</span>
          <span className={styles.menuLink}>Settings</span>
        </nav>
      </aside>

      <div className={styles.content}>
        <div className={styles.topbar}>
          <p className={styles.title}>{title}</p>
          <div className={styles.topActions}>
            <span>Search</span>
            <span>Admin</span>
          </div>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
