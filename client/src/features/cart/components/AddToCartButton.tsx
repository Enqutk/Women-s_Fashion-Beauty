"use client";

import { useState } from "react";
import { getAuthToken } from "@/features/auth/utils/auth-storage";
import { addToCart } from "../services/cart.api";
import styles from "./AddToCartButton.module.css";

type AddToCartButtonProps = {
  productId: number;
};

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [status, setStatus] = useState<string | null>(null);
  const isError = status !== null && status !== "Added to cart";

  async function onAdd(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      setStatus("Redirecting to login...");
      window.location.href = "/login";
      setTimeout(() => setStatus(null), 1200);
      return;
    }

    try {
      await addToCart(productId, 1);
      setStatus("Added to cart");
      window.dispatchEvent(new Event("cart:changed"));
      setTimeout(() => setStatus(null), 1400);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Failed";
      if (rawMessage.toLowerCase().includes("missing authentication token")) {
        setStatus("Redirecting to login...");
        window.location.href = "/login";
      } else {
        setStatus("Unable to add item");
      }
      setTimeout(() => setStatus(null), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={`${styles.button} ${status === "Added to cart" ? styles.success : ""} ${isError ? styles.error : ""}`}
    >
      {status ?? "Add to Cart"}
    </button>
  );
}
