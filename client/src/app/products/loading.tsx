import styles from "./products-loading.module.css";

export default function ProductsLoading() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <h1 className={styles.title}>Loading products...</h1>
        <p className={styles.subtitle}>Please wait while we prepare the collection.</p>
        <section className={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <article key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonLineWide} />
              <div className={styles.skeletonLine} />
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
