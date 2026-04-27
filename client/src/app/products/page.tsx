import Link from "next/link";
import ProductCard from "@/features/product/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/features/product/services/product.api";
import styles from "./products.module.css";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedCategoryId = params?.category ? Number(params.category) : null;
  const rawQuery = params?.q?.trim() ?? "";
  const searchQuery = rawQuery.toLowerCase();

  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  const hasCanonicalShoes = categories.some((category) => category.name.toLowerCase() === "shoes");
  const visibleCategories = categories.filter((category) => {
    if (hasCanonicalShoes && category.name.toLowerCase() === "shoe") {
      return false;
    }
    return true;
  });

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategoryId && Number.isInteger(selectedCategoryId)
        ? product.categoryId === selectedCategoryId
        : true;
    if (!matchesCategory) {
      return false;
    }
    if (!searchQuery) {
      return true;
    }
    return (
      product.name.toLowerCase().includes(searchQuery) ||
      (product.description ?? "").toLowerCase().includes(searchQuery) ||
      (product.categoryName ?? "").toLowerCase().includes(searchQuery)
    );
  });

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
            {visibleCategories.map((category) => {
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
