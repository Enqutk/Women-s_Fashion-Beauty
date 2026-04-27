import Link from "next/link";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import { fetchProducts } from "@/features/product/services/product.api";
import styles from "./accessories.module.css";

export default async function AccessoriesPage() {
  const products = await fetchProducts();
  const accessoryProducts = products
    .filter((product) => {
      const categoryName = (product.categoryName ?? "").toLowerCase();
      const productName = (product.name ?? "").toLowerCase();
      const productDescription = (product.description ?? "").toLowerCase();
      return (
        categoryName.includes("accessor") ||
        productName.includes("accessor") ||
        productName.includes("earring") ||
        productName.includes("sunglass") ||
        productDescription.includes("accessor")
      );
    })
    .slice(0, 12);

  return (
    <main className={styles.page}>
      <section className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroImage} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Curated Accessories</h1>
            <p className={styles.heroText}>Discover jewelry, sunglasses, and finishing touches.</p>
            <Link href="/products" className={styles.heroCta}>
              SHOP ALL ACCESSORIES
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured Accessories</h2>
          <div className={styles.grid}>
            {accessoryProducts.length > 0 ? (
              accessoryProducts.map((product) => (
                <article className={styles.item} key={product.id}>
                  <Link href={`/products/${product.id}`} className={styles.itemLink}>
                    <div className={styles.itemImage}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className={styles.itemImageEl} />
                      ) : (
                        "Image unavailable"
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
              ))
            ) : (
              <p style={{ color: "#6b7280", padding: "0.4rem" }}>
                Accessories are currently being updated. Please check back shortly.
              </p>
            )}
          </div>
        </section>

        <section className={styles.banner}>
          <div className={styles.bannerText}>
            <h3 className={styles.bannerTitle}>Editor&apos;s Picks: Accessories</h3>
            <p style={{ marginTop: "0.5rem", color: "#555" }}>
              Complete your look with elevated details and timeless accents.
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
