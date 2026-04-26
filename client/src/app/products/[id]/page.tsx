import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import { fetchProductById } from "@/features/product/services/product.api";

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <Link href="/products">← Back to products</Link>

      <section
        style={{
          marginTop: "1rem",
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: "1.2rem",
          display: "grid",
          gap: "0.75rem",
        }}
      >
        <p style={{ color: "#666" }}>{product.categoryName ?? "Uncategorized"}</p>
        <h1>{product.name}</h1>
        <p style={{ fontSize: 24, fontWeight: 700 }}>${product.price.toFixed(2)}</p>
        <p>{product.description ?? "No description available for this product."}</p>
        <p style={{ color: "#666" }}>
          Product ID: {product.id} | Category ID: {product.categoryId}
        </p>
        <div>
          <AddToCartButton productId={product.id} />
        </div>
      </section>
    </main>
  );
}
