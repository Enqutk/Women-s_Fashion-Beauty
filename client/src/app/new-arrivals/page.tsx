import Link from "next/link";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import { fetchProducts } from "@/features/product/services/product.api";
import styles from "./new-arrivals.module.css";

export default async function NewArrivalsPage() {
  const products = await fetchProducts();
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  return (
    <main className={styles.page}>
      <section className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroImage} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>The New Elegance</h1>
            <p className={styles.heroText}>Discover our latest curated arrivals for the season.</p>
            <Link href="/products" className={styles.heroCta}>
              SHOP NEW ARRIVALS
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Posted Recently</h2>
          <div className={styles.grid}>
            {recentProducts.map((item) => (
              <article className={styles.item} key={item.id}>
                <Link href={`/products/${item.id}`} className={styles.itemLink}>
                  <div className={styles.itemImage}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className={styles.itemImageEl} />
                    ) : (
                      "Image"
                    )}
                  </div>
                </Link>
                <div className={styles.itemBody}>
                  <Link href={`/products/${item.id}`} className={styles.itemLink}>
                    <p className={styles.itemName}>{item.name}</p>
                  </Link>
                  <p className={styles.itemMeta}>${item.price.toFixed(2)}</p>
                  <div className={styles.itemAction}>
                    <AddToCartButton productId={item.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
