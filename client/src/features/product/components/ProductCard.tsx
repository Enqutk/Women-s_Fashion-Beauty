import Link from "next/link";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 10,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          height: 180,
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#666",
          padding: "0.75rem",
          textAlign: "center",
        }}
      >
        {product.imageUrl ? "Image available" : "No image"}
      </div>

      <div style={{ padding: "0.9rem" }}>
        <p style={{ fontSize: 12, color: "#666" }}>{product.categoryName ?? "Uncategorized"}</p>
        <h3 style={{ marginTop: "0.35rem", fontSize: 17 }}>{product.name}</h3>
        <p style={{ marginTop: "0.45rem", fontWeight: 700 }}>${product.price.toFixed(2)}</p>
        <p style={{ marginTop: "0.45rem", color: "#555", minHeight: 42 }}>
          {product.description ? product.description.slice(0, 80) : "No description"}
        </p>
        <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href={`/products/${product.id}`}>View details</Link>
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </article>
  );
}
