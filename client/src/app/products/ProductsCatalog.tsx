import Link from "next/link";
import ProductCard from "@/features/product/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/features/product/services/product.api";
import styles from "./products.module.css";

type ProductsCatalogProps = {
  categorySlug: string | null;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
};

type BuildUrlInput = {
  q?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
};

export default async function ProductsCatalog({
  categorySlug,
  q,
  minPrice,
  maxPrice,
}: ProductsCatalogProps) {
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  const hasCanonicalShoes = categories.some((category) => category.name.toLowerCase() === "shoes");
  const visibleCategories = categories.filter((category) => {
    if (hasCanonicalShoes && category.name.toLowerCase() === "shoe") {
      return false;
    }
    return true;
  });

  const normalizedSlug = categorySlug ? categorySlug.toLowerCase() : null;
  const normalizedMatchSlug = normalizedSlug === "shoe" ? "shoes" : normalizedSlug;
  const activeCategory = normalizedMatchSlug
    ? visibleCategories.find((category) => {
        const currentSlug = category.name.toLowerCase() === "shoe" ? "shoes" : category.name.toLowerCase();
        return currentSlug === normalizedMatchSlug;
      }) ?? null
    : null;

  const selectedCategoryId = activeCategory?.id ?? null;
  const rawQuery = q?.trim() ?? "";
  const searchQuery = rawQuery.toLowerCase();
  const parsedMin = minPrice ? Number(minPrice) : null;
  const parsedMax = maxPrice ? Number(maxPrice) : null;
  const hasValidMinPrice = parsedMin !== null && Number.isFinite(parsedMin) && parsedMin >= 0;
  const hasValidMaxPrice = parsedMax !== null && Number.isFinite(parsedMax) && parsedMax >= 0;

  const basePath = activeCategory ? `/products/category/${normalizedMatchSlug}` : "/products";

  const buildCurrentUrl = (next: BuildUrlInput): string => {
    const query = new URLSearchParams();
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
    return serialized ? `${basePath}?${serialized}` : basePath;
  };

  const buildCategoryUrl = (target: string | null): string => {
    const targetPath = target ? `/products/category/${target}` : "/products";
    const query = new URLSearchParams();
    if (rawQuery) {
      query.set("q", rawQuery);
    }
    const serialized = query.toString();
    return serialized ? `${targetPath}?${serialized}` : targetPath;
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategoryId ? product.categoryId === selectedCategoryId : true;
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
    })
    .filter((product) => {
      if (hasValidMinPrice && product.price < (parsedMin as number)) {
        return false;
      }
      if (hasValidMaxPrice && product.price > (parsedMax as number)) {
        return false;
      }
      return true;
    });

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{activeCategory ? `${activeCategory.name} products` : "Shop Products"}</h1>
          <p className={styles.muted}>Browse fashion and beauty products by category.</p>
        </div>
        <Link href="/" className={styles.backLink}>
          Back to home
        </Link>
      </div>

      <div className={styles.categoryStrip}>
        <Link
          href={buildCategoryUrl(null)}
          className={`${styles.categoryTab} ${!activeCategory ? styles.categoryTabActive : ""}`}
        >
          All
        </Link>
        {visibleCategories.map((category) => {
          const slug = category.name.toLowerCase() === "shoe" ? "shoes" : category.name.toLowerCase();
          const isActive = activeCategory?.id === category.id;
          return (
            <Link
              key={category.id}
              href={buildCategoryUrl(slug)}
              className={`${styles.categoryTab} ${isActive ? styles.categoryTabActive : ""}`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      <p className={styles.resultCount}>
        {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
      </p>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Price Filter</h2>
          <div className={styles.priceSection}>
            <p className={styles.priceTitle}>Set your budget</p>
            <form action={basePath} method="get" className={styles.priceForm}>
              {rawQuery ? <input type="hidden" name="q" value={rawQuery} /> : null}
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  step="1"
                  placeholder="Min"
                  defaultValue={hasValidMinPrice ? String(parsedMin) : ""}
                  className={styles.priceInput}
                />
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  step="1"
                  placeholder="Max"
                  defaultValue={hasValidMaxPrice ? String(parsedMax) : ""}
                  className={styles.priceInput}
                />
              </div>
              <button type="submit" className={styles.applyBtn}>
                Apply
              </button>
            </form>
            <div className={styles.pricePresets}>
              <Link
                href={buildCurrentUrl({
                  q: rawQuery,
                  minPrice: null,
                  maxPrice: null,
                })}
                className={`${styles.pricePreset} ${!hasValidMinPrice && !hasValidMaxPrice ? styles.pricePresetActive : ""}`}
              >
                Any price
              </Link>
              <Link
                href={buildCurrentUrl({
                  q: rawQuery,
                  minPrice: 0,
                  maxPrice: 25,
                })}
                className={styles.pricePreset}
              >
                Under $25
              </Link>
              <Link
                href={buildCurrentUrl({
                  q: rawQuery,
                  minPrice: 25,
                  maxPrice: 75,
                })}
                className={styles.pricePreset}
              >
                $25 - $75
              </Link>
              <Link
                href={buildCurrentUrl({
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
            <Link href={basePath} className={styles.clearBtn}>
              Clear filters
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
