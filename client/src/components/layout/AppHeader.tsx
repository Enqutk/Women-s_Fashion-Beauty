"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearAuthSession,
  clearLegacyPersistentAuth,
  getAuthRole,
  getAuthToken,
} from "@/features/auth/utils/auth-storage";
import { fetchCart } from "@/features/cart/services/cart.api";
import styles from "./AppHeader.module.css";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20L16.6 16.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19C6.6 16.7 9 15.5 12 15.5C15 15.5 17.4 16.7 19 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5H5L7 16H18L20 8H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19.5" r="1.2" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function AppHeader() {
  const [count, setCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadCount(): Promise<void> {
      // Enforce session-only auth and remove legacy persistent tokens.
      clearLegacyPersistentAuth();
      const token = getAuthToken();
      const role = getAuthRole();
      if (!token) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setCount(0);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const meResponse = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!meResponse.ok) {
          clearAuthSession();
          setIsAuthenticated(false);
          setIsAdmin(false);
          setCount(0);
          return;
        }

        setIsAuthenticated(true);
        setIsAdmin(role === "admin");
        const cart = await fetchCart();
        setCount(cart.totalItems);
      } catch (_error) {
        clearAuthSession();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setCount(0);
      }
    }

    loadCount();
    window.addEventListener("cart:changed", loadCount);
    return () => window.removeEventListener("cart:changed", loadCount);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.topStrip}>women&apos;s fashion and beauty e-commerce</div>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Mintech Solution.
        </Link>
        <nav className={styles.nav}>
          <Link href="/new-arrivals" className={styles.navLink}>
            NEW ARRIVALS
          </Link>
          <Link href="/clothing" className={styles.navLink}>
            CLOTHING
          </Link>
          <Link href="/bags" className={styles.navLink}>
            BAGS
          </Link>
          <Link href="/shoes" className={styles.navLink}>
            SHOES
          </Link>
          <Link href="/beauty" className={styles.navLink}>
            BEAUTY
          </Link>
          <Link href="/sale" className={styles.navLink}>
            SALE
          </Link>
          <Link href="/products" className={styles.iconLink} aria-label="Search">
            <SearchIcon />
          </Link>
          {!isAuthenticated ? (
            <>
              <Link href="/login" className={styles.iconTextLink}>
                <UserIcon />
                <span>Login</span>
              </Link>
              <Link href="/register" className={styles.navLink}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link href="/cart" className={styles.iconTextLink}>
                <CartIcon />
                <span>
                  Cart <span className={styles.cartCount}>({count})</span>
                </span>
              </Link>
              <Link href="/checkout" className={styles.navLink}>
                Checkout
              </Link>
              <Link href="/orders" className={styles.navLink}>
                Orders
              </Link>
              {isAdmin ? (
                <Link href="/admin/dashboard" className={styles.navLink}>
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                className={styles.navLink}
                onClick={() => {
                  clearAuthSession();
                  setIsAuthenticated(false);
                  setIsAdmin(false);
                  setCount(0);
                  window.dispatchEvent(new Event("cart:changed"));
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
