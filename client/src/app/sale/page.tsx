import { fetchProducts } from "@/features/product/services/product.api";
import styles from "./sale.module.css";

export default async function SalePage() {
  const products = await fetchProducts();
  const featured = products.filter((product) => product.isOnSale).slice(0, 12);
  const hasTaggedSaleProducts = featured.length > 0;

  return (
    <main className={styles.page}>
      <section className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroTextTop}>Seasonal Clearance 50% Off</div>
          <div className={styles.heroSub}>Final Chance | Sale</div>
          <div className={styles.heroTextBottom}>Up To 50% Off</div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Sale Favorites</h1>
          <div className={styles.grid}>
            {featured.map((product) => {
              const currentPrice = product.price;
              const oldPrice = currentPrice * 2;

              return (
                <article className={styles.item} key={product.id}>
                  <div className={styles.itemImage}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className={styles.itemImageEl} />
                    ) : (
                      "Image"
                    )}
                    <span className={styles.saleTag}>SALE OFF</span>
                  </div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemName}>{product.name}</p>
                    <p className={styles.itemPrice}>
                      <span className={styles.oldPrice}>${oldPrice.toFixed(2)}</span>
                      <span className={styles.newPrice}>${currentPrice.toFixed(2)}</span>
                    </p>
                  </div>
                </article>
              );
            })}
            {!hasTaggedSaleProducts ? (
              <p className={styles.emptyState}>
                No sale-tagged products yet. Mark products as sale from Admin Products.
              </p>
            ) : null}
          </div>
        </section>

        <section className={styles.banner}>
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>Sale Live</h2>
            <p style={{ marginTop: "0.5rem", color: "#555" }}>
              Explore our limited-time markdowns before they are gone.
            </p>
          </div>
          <div className={styles.bannerImage} />
        </section>
      </section>
    </main>
  );
}
