"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAuthSession,
  clearLegacyPersistentAuth,
  getAuthRole,
  getAuthToken,
} from "@/features/auth/utils/auth-storage";
import { fetchCart } from "@/features/cart/services/cart.api";
import { fetchCategories } from "@/features/product/services/product.api";
import type { Category } from "@/features/product/types";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [count, setCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      try {
        const items = await fetchCategories();
        setCategories(items);
      } catch (_error) {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

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

  const beautyChildNames = new Set(["skincare", "perfume", "makeup"]);
  const beautyChildren = categories.filter((category) =>
    beautyChildNames.has(category.name.toLowerCase()),
  );
  const topCategories = categories.filter((category) => {
    const name = category.name.toLowerCase();
    return name !== "beauty" && !beautyChildNames.has(name);
  });
  const visibleCategories = topCategories.slice(0, 6);
  const activeCategoryId = Number(searchParams.get("category"));
  const isBeautyCategoryActive = beautyChildren.some((category) => category.id === activeCategoryId);
  const isBeautyActive = pathname === "/beauty" || (pathname === "/products" && isBeautyCategoryActive);

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const categoryHref = (category: Category): string => {
    const slug = category.name.toLowerCase();
    if (["clothing", "bags", "shoes", "beauty", "accessories"].includes(slug)) {
      return `/${slug}`;
    }
    return `/products?category=${category.id}`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.topStrip}>Premium women&apos;s fashion, beauty, and accessories</div>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Mintech Solution.
        </Link>
        <button
          type="button"
          className={styles.hamburger}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <Link
            href="/new-arrivals"
            className={`${styles.navLink} ${pathname === "/new-arrivals" ? styles.activeNavLink : ""}`}
            onClick={closeMenu}
          >
            NEW ARRIVALS
          </Link>
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category)}
              className={`${styles.navLink} ${
                (pathname === "/products" && activeCategoryId === category.id) ||
                pathname === `/${category.name.toLowerCase()}`
                  ? styles.activeNavLink
                  : ""
              }`}
              onClick={closeMenu}
            >
              {category.name.toUpperCase()}
            </Link>
          ))}
          <div className={styles.beautyGroup}>
            <Link
              href="/beauty"
              className={`${styles.navLink} ${isBeautyActive ? styles.activeNavLink : ""}`}
              onClick={closeMenu}
            >
              BEAUTY
            </Link>
            {beautyChildren.length > 0 ? (
              <div className={styles.beautySubmenu}>
                {beautyChildren.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className={`${styles.beautySubLink} ${
                      pathname === "/products" && activeCategoryId === category.id
                        ? styles.activeBeautySubLink
                        : ""
                    }`}
                    onClick={closeMenu}
                  >
                    {category.name.toUpperCase()}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link
            href="/sale"
            className={`${styles.navLink} ${pathname === "/sale" ? styles.activeNavLink : ""}`}
            onClick={closeMenu}
          >
            SALE
          </Link>
          <Link href="/products" className={styles.iconLink} aria-label="Search" onClick={closeMenu}>
            <SearchIcon />
          </Link>
          {!isAuthenticated ? (
            <>
              <Link href="/login" className={styles.iconTextLink} onClick={closeMenu}>
                <UserIcon />
                <span>Login</span>
              </Link>
              <Link href="/register" className={styles.navLink} onClick={closeMenu}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link href="/cart" className={styles.iconTextLink} onClick={closeMenu}>
                <CartIcon />
                <span>
                  Cart <span className={styles.cartCount}>({count})</span>
                </span>
              </Link>
              <Link href="/checkout" className={styles.navLink} onClick={closeMenu}>
                Checkout
              </Link>
              <Link href="/orders" className={styles.navLink} onClick={closeMenu}>
                Orders
              </Link>
              {isAdmin ? (
                <Link href="/admin/dashboard" className={styles.navLink} onClick={closeMenu}>
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
                  closeMenu();
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
