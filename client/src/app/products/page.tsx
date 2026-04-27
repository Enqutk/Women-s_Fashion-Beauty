import Link from "next/link";
import ProductCard from "@/features/product/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/features/product/services/product.api";
import styles from "./products.module.css";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedCategoryId = params?.category ? Number(params.category) : null;

  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);

  const filteredProducts =
    selectedCategoryId && Number.isInteger(selectedCategoryId)
      ? products.filter((product) => product.categoryId === selectedCategoryId)
      : products;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Shop Products</h1>
          <p className={styles.muted}>
            Browse fashion and beauty products by category.
          </p>
        </div>
        <Link href="/">Back to home</Link>
      </div>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Filters</h2>
          <div className={styles.filterRow}>
            <Link
              className={`${styles.chip} ${selectedCategoryId ? "" : styles.chipActive}`}
              href="/products"
            >
              All
            </Link>
            {categories.map((category) => {
              const isActive = selectedCategoryId === category.id;
              return (
                <Link
                  key={category.id}
                  className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                  href={`/products?category=${category.id}`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </aside>

        {filteredProducts.length === 0 ? (
          <p style={{ marginTop: "1.2rem" }}>No products are currently available in this category.</p>
        ) : (
          <section className={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
