import Link from "next/link";
import { fetchCategories, fetchProducts } from "@/features/product/services/product.api";
import styles from "./home.module.css";

export default async function Home() {
  const categories = await fetchCategories();
  const products = await fetchProducts();
  const topCategories = categories.slice(0, 3);
  const featuredDeals = products.slice(0, 8);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Embrace Your Elegance.</h1>
          <p className={styles.heroSubtitle}>The Spring/Summer Collection is here.</p>
          <Link href="/products" className={styles.cta}>
            SHOP NEW
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shop by Category</h2>
        <div className={styles.categoryGrid}>
          {topCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className={`${styles.categoryCard} ${
                index === 0 ? styles.bag : index === 1 ? styles.shoe : styles.perfume
              }`}
            >
              {category.name} &gt;
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} style={{ textAlign: "left", fontSize: "1.8rem" }}>
            Today&apos;s Featured Deals
          </h2>
          <Link href="/products" className={styles.seeAll}>
            See all deals →
          </Link>
        </div>

        <div className={styles.pillRow}>
          {["Skin Care", "Makeup", "Hair Care", "Fragrance", "Bags", "Shoes"].map((tag) => (
            <span key={tag} className={styles.pill}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.dealGrid}>
          {featuredDeals.map((product) => {
            const originalPrice = Number((product.price / 0.83).toFixed(2));
            return (
              <article className={styles.dealCard} key={product.id}>
                <div className={styles.dealImage}>
                  <span className={styles.discountTag}>-17%</span>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className={styles.dealImageEl} />
                  ) : (
                    "Image"
                  )}
                </div>
                <div className={styles.dealBody}>
                  <p className={styles.dealName}>{product.name}</p>
                  <div className={styles.dealPriceRow}>
                    <span className={styles.dealPrice}>${product.price.toFixed(2)}</span>
                    <span className={styles.dealOldPrice}>${originalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

    </main>
  );
}
