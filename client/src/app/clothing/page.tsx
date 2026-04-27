import Link from "next/link";
import { fetchProducts } from "@/features/product/services/product.api";
import styles from "./clothing.module.css";

export default async function ClothingPage() {
  const products = await fetchProducts();
  const featured = products.slice(0, 12);

  return (
    <main className={styles.page}>
      <section className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroImage} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Curated Clothing</h1>
            <p className={styles.heroText}>Explore our new season essentials and statement pieces.</p>
            <Link href="/products" className={styles.heroCta}>
              SHOP ALL CLOTHING
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured Clothing</h2>
          <div className={styles.grid}>
            {featured.map((product) => (
              <article className={styles.item} key={product.id}>
                <div className={styles.itemImage}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className={styles.itemImageEl} />
                  ) : (
                    "Image unavailable"
                  )}
                </div>
                <div className={styles.itemBody}>
                  <p className={styles.itemName}>{product.name}</p>
                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>${product.price.toFixed(2)}</span>
                    <span className={styles.tag}>Stock</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.banner}>
          <div className={styles.bannerText}>
            <h3 className={styles.bannerTitle}>Editor&apos;s Picks: Dresses</h3>
            <p style={{ marginTop: "0.5rem", color: "#555" }}>
              Explore our new season essentials and statement pieces.
            </p>
            <Link href="/products" className={styles.heroCta} style={{ marginTop: "0.8rem" }}>
              SHOP NOW
            </Link>
          </div>
          <div className={styles.bannerImage} />
        </section>
      </section>
    </main>
  );
}
