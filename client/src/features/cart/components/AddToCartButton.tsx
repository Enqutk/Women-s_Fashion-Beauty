"use client";

import { useState } from "react";
import { addToCart } from "../services/cart.api";

type AddToCartButtonProps = {
  productId: number;
};

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function onAdd(): Promise<void> {
    try {
      await addToCart(productId, 1);
      setStatus("Added");
      window.dispatchEvent(new Event("cart:changed"));
      setTimeout(() => setStatus(null), 1400);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed");
      setTimeout(() => setStatus(null), 2000);
    }
  }

  return (
    <button type="button" onClick={onAdd}>
      {status ?? "Add to cart"}
    </button>
  );
}
