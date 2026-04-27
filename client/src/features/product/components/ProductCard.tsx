import Link from "next/link";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import type { Product } from "../types";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.image} />
        ) : (
          "No image"
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{product.categoryName ?? "Uncategorized"}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <p className={styles.desc}>
          {product.description ? product.description.slice(0, 80) : "No description"}
        </p>
        <div className={styles.actions}>
          <Link href={`/products/${product.id}`} className={styles.viewLink}>
            View details
          </Link>
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </article>
  );
}
