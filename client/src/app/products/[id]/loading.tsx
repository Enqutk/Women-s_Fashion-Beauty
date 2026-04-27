import styles from "./product-loading.module.css";

export default function ProductDetailsLoading() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <h1 className={styles.title}>Loading product details...</h1>
        <div className={styles.content}>
          <div className={styles.imageSkeleton} />
          <div className={styles.details}>
            <div className={styles.lineWide} />
            <div className={styles.lineMid} />
            <div className={styles.lineWide} />
            <div className={styles.lineShort} />
          </div>
        </div>
      </section>
    </main>
  );
}
