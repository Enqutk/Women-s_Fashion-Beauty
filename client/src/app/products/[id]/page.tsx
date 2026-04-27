import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import { fetchProductById } from "@/features/product/services/product.api";
import styles from "../product-details.module.css";

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
    <main className={styles.page}>
      <Link href="/products">← Back to products</Link>

      <section className={styles.card}>
        <div className={styles.imagePanel}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className={styles.image} />
          ) : (
            "Product image"
          )}
        </div>
        <div className={styles.content}>
          <p className={styles.category}>{product.categoryName ?? "Uncategorized"}</p>
          <h1>{product.name}</h1>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
          <p>{product.description ?? "No description available for this product."}</p>
          <p className={styles.meta}>
            Product ID: {product.id} | Category ID: {product.categoryId}
          </p>
          <div>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </section>
    </main>
  );
}
