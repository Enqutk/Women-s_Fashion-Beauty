"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCart } from "@/features/cart/services/cart.api";

export default function AppHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadCount(): Promise<void> {
      try {
        const cart = await fetchCart();
        setCount(cart.totalItems);
      } catch (_error) {
        setCount(0);
      }
    }

    loadCount();
    window.addEventListener("cart:changed", loadCount);
    return () => window.removeEventListener("cart:changed", loadCount);
  }, []);

  return (
    <header
      style={{
        borderBottom: "1px solid #eaeaea",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.8rem",
      }}
    >
      <Link href="/" style={{ fontWeight: 700 }}>
        Women&apos;s Fashion & Beauty
      </Link>
      <nav style={{ display: "flex", gap: "0.9rem", alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/products">Shop</Link>
        <Link href="/cart">Cart ({count})</Link>
        <Link href="/checkout">Checkout</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/orders">Admin Orders</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    </header>
  );
}
