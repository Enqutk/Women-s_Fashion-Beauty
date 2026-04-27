import Link from "next/link";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import { fetchProducts } from "@/features/product/services/product.api";
import styles from "./bags.module.css";

export default async function BagsPage() {
  const products = await fetchProducts();
  const featured = products
    .filter((product) => (product.categoryName ?? "").toLowerCase().includes("bag"))
    .slice(0, 12);
  const visibleProducts = featured.length > 0 ? featured : products.slice(0, 12);

  return (
    <main className={styles.page}>
      <section className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroImage} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Curated Bags</h1>
            <p className={styles.heroText}>Discover our new season essentials and statement bags.</p>
            <Link href="/products" className={styles.heroCta}>
              SHOP ALL BAGS
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bags Favorites</h2>
          <div className={styles.grid}>
            {visibleProducts.map((product) => (
              <article className={styles.item} key={product.id}>
                <Link href={`/products/${product.id}`} className={styles.itemLink}>
                  <div className={styles.itemImage}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className={styles.itemImageEl} />
                    ) : (
                      "Image"
                    )}
                  </div>
                </Link>
                <div className={styles.itemBody}>
                  <Link href={`/products/${product.id}`} className={styles.itemLink}>
                    <p className={styles.itemName}>{product.name}</p>
                  </Link>
                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>${product.price.toFixed(2)}</span>
                    <span className={styles.tag}>Stock</span>
                  </div>
                  <div className={styles.actionRow}>
                    <AddToCartButton productId={product.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.banner}>
          <div className={styles.bannerText}>
            <h3 className={styles.bannerTitle}>Trend Alert: Bags</h3>
            <p style={{ marginTop: "0.5rem", color: "#555" }}>
              Explore our latest bag essentials and statement pieces.
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
