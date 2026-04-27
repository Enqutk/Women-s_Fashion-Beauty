import Link from "next/link";
import ProductCard from "@/features/product/components/ProductCard";
import { fetchProducts } from "@/features/product/services/product.api";
import styles from "./products.module.css";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedCategoryId = params?.category ? Number(params.category) : null;
  const rawQuery = params?.q?.trim() ?? "";
  const searchQuery = rawQuery.toLowerCase();
  const minPrice = params?.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : null;
  const hasValidMinPrice = minPrice !== null && Number.isFinite(minPrice) && minPrice >= 0;
  const hasValidMaxPrice = maxPrice !== null && Number.isFinite(maxPrice) && maxPrice >= 0;

  const products = await fetchProducts();

  const buildProductsUrl = (next: {
    category?: number | null;
    q?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
  }): string => {
    const query = new URLSearchParams();
    if (next.category && Number.isInteger(next.category)) {
      query.set("category", String(next.category));
    }
    if (next.q && next.q.trim()) {
      query.set("q", next.q.trim());
    }
    if (next.minPrice !== null && next.minPrice !== undefined && Number.isFinite(next.minPrice)) {
      query.set("minPrice", String(next.minPrice));
    }
    if (next.maxPrice !== null && next.maxPrice !== undefined && Number.isFinite(next.maxPrice)) {
      query.set("maxPrice", String(next.maxPrice));
    }
    const serialized = query.toString();
    return serialized ? `/products?${serialized}` : "/products";
  };

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
  }).filter((product) => {
    if (hasValidMinPrice && product.price < (minPrice as number)) {
      return false;
    }
    if (hasValidMaxPrice && product.price > (maxPrice as number)) {
      return false;
    }
    return true;
  });

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shop Products</h1>
          <p className={styles.muted}>
            Browse fashion and beauty products by category.
          </p>
        </div>
        <Link href="/" className={styles.backLink}>
          Back to home
        </Link>
      </div>
      <p className={styles.resultCount}>
        {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
      </p>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Price Filter</h2>
          <div className={styles.priceSection}>
            <p className={styles.priceTitle}>Set your budget</p>
            <form action="/products" method="get" className={styles.priceForm}>
              {selectedCategoryId ? (
                <input type="hidden" name="category" value={String(selectedCategoryId)} />
              ) : null}
              {rawQuery ? <input type="hidden" name="q" value={rawQuery} /> : null}
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  step="1"
                  placeholder="Min"
                  defaultValue={hasValidMinPrice ? String(minPrice) : ""}
                  className={styles.priceInput}
                />
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  step="1"
                  placeholder="Max"
                  defaultValue={hasValidMaxPrice ? String(maxPrice) : ""}
                  className={styles.priceInput}
                />
              </div>
              <button type="submit" className={styles.applyBtn}>
                Apply
              </button>
            </form>
            <div className={styles.pricePresets}>
              <Link
                href={buildProductsUrl({
                  category: selectedCategoryId,
                  q: rawQuery,
                  minPrice: null,
                  maxPrice: null,
                })}
                className={`${styles.pricePreset} ${!hasValidMinPrice && !hasValidMaxPrice ? styles.pricePresetActive : ""}`}
              >
                Any price
              </Link>
              <Link
                href={buildProductsUrl({
                  category: selectedCategoryId,
                  q: rawQuery,
                  minPrice: 0,
                  maxPrice: 25,
                })}
                className={styles.pricePreset}
              >
                Under $25
              </Link>
              <Link
                href={buildProductsUrl({
                  category: selectedCategoryId,
                  q: rawQuery,
                  minPrice: 25,
                  maxPrice: 75,
                })}
                className={styles.pricePreset}
              >
                $25 - $75
              </Link>
              <Link
                href={buildProductsUrl({
                  category: selectedCategoryId,
                  q: rawQuery,
                  minPrice: 75,
                  maxPrice: null,
                })}
                className={styles.pricePreset}
              >
                $75+
              </Link>
            </div>
          </div>
        </aside>

        {filteredProducts.length === 0 ? (
          <section className={styles.emptyState}>
            <h2>No products found</h2>
            <p>Try a different category, keyword, or price range.</p>
            <Link href="/products" className={styles.clearBtn}>
              Clear all filters
            </Link>
          </section>
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
