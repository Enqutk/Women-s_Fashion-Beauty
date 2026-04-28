"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { getAuthToken } from "@/features/auth/utils/auth-storage";
import styles from "../admin.module.css";

type Category = {
  id: number;
  name: string;
  description: string | null;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  isOnSale: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productCategoryId, setProductCategoryId] = useState<number | "">("");
  const [productIsOnSale, setProductIsOnSale] = useState(false);

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeManageCategoryId, setActiveManageCategoryId] = useState<number | "all">("all");

  const selectedCategoryExists = useMemo(
    () => categories.some((category) => category.id === productCategoryId),
    [categories, productCategoryId],
  );
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const productsByCategory = useMemo(
    () =>
      sortedCategories.map((category) => ({
        category,
        items: products
          .filter((product) => product.categoryId === category.id)
          .sort((a, b) => a.name.localeCompare(b.name)),
      })),
    [products, sortedCategories],
  );
  const visibleCategoryGroups = useMemo(
    () =>
      activeManageCategoryId === "all"
        ? productsByCategory
        : productsByCategory.filter((group) => group.category.id === activeManageCategoryId),
    [activeManageCategoryId, productsByCategory],
  );

  async function loadData(): Promise<void> {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/products`, { cache: "no-store" }),
    ]);

    if (!categoriesResponse.ok || !productsResponse.ok) {
      throw new Error("Failed to load products/categories");
    }

    const [categoriesPayload, productsPayload] = await Promise.all([
      categoriesResponse.json(),
      productsResponse.json(),
    ]);

    setCategories(categoriesPayload as Category[]);
    setProducts(productsPayload as Product[]);
  }

  useEffect(() => {
    loadData().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data");
    });
  }, []);

  async function onCreateCategory(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: categoryName,
        description: categoryDescription || undefined,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload?.message ?? "Failed to create category");
      return;
    }

    setCategoryName("");
    setCategoryDescription("");
    await loadData();
    setStatus("Category created");
  }

  async function onCreateOrUpdateProduct(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!selectedCategoryExists || typeof productCategoryId !== "number") {
      setError("Select a valid category");
      return;
    }
    if (!productImageUrl) {
      setError("Please upload a product image.");
      return;
    }

    const payload = {
      name: productName,
      description: productDescription || undefined,
      price: Number(productPrice),
      imageUrl: productImageUrl,
      categoryId: productCategoryId,
      isOnSale: productIsOnSale,
    };

    const isEditing = editingProductId !== null;
    const endpoint = isEditing
      ? `${API_BASE_URL}/api/products/${editingProductId}`
      : `${API_BASE_URL}/api/products`;
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responsePayload = await response.json();
      setError(responsePayload?.message ?? "Failed to save product");
      return;
    }

    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductImageUrl("");
    setProductCategoryId("");
    setProductIsOnSale(false);
    setEditingProductId(null);
    await loadData();
    setStatus(isEditing ? "Product updated" : "Product created");
  }

  async function onDeleteProduct(id: number): Promise<void> {
    setError(null);
    setStatus(null);

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload?.message ?? "Failed to delete product");
      return;
    }

    await loadData();
    setStatus("Product deleted");
  }

  function onEditProduct(product: Product): void {
    setShowProductForm(true);
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description ?? "");
    setProductPrice(String(product.price));
    setProductImageUrl(product.imageUrl ?? "");
    setProductCategoryId(product.categoryId);
    setProductIsOnSale(product.isOnSale);
    setStatus("Editing selected product");
    setError(null);
  }

  function resetProductForm(): void {
    setEditingProductId(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductImageUrl("");
    setProductCategoryId("");
    setProductIsOnSale(false);
  }

  function onImageFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        setError("Failed to read the selected image.");
        return;
      }
      setProductImageUrl(dataUrl);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the selected image.");
    };
    reader.readAsDataURL(selectedFile);
  }

  return (
    <AdminShell title="Products Management">
      <main className={styles.page}>
      <h1 className={styles.title}>Products Management</h1>
      <p className={styles.muted}>
        Manage your catalog with clear categories and optional sale tagging.
      </p>

      {status ? <p className={`${styles.alert} ${styles.ok}`}>{status}</p> : null}
      {error ? <p className={`${styles.alert} ${styles.error}`}>{error}</p> : null}

      <section className={`${styles.section} ${styles.card}`}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionHeading}>Catalog actions</h2>
          <div className={styles.actions}>
            <button type="button" onClick={() => setShowCategoryForm((prev) => !prev)}>
              {showCategoryForm ? "Hide category form" : "Add category"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowProductForm((prev) => !prev);
                if (!showProductForm) {
                  setEditingProductId(null);
                }
              }}
            >
              {showProductForm ? "Hide product form" : "Add product"}
            </button>
          </div>
        </div>

        {showCategoryForm ? (
          <form onSubmit={onCreateCategory} className={styles.formGrid}>
            <input
              required
              placeholder="Category name"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
            />
            <input
              placeholder="Category description (optional)"
              value={categoryDescription}
              onChange={(event) => setCategoryDescription(event.target.value)}
            />
            <button type="submit" className={styles.narrowButton}>
              Create category
            </button>
          </form>
        ) : null}

        {showProductForm ? (
          <form onSubmit={onCreateOrUpdateProduct} className={styles.formGrid}>
            <h3 className={styles.formTitle}>
              {editingProductId ? "Edit selected product" : "Create new product"}
            </h3>
            <input
              required
              placeholder="Product name"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
            <textarea
              placeholder="Description"
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
              className={styles.productDescriptionField}
            />
            <input
              required
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Price"
              value={productPrice}
              onChange={(event) => setProductPrice(event.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={onImageFileChange}
            />
            {productImageUrl ? (
              <div className={styles.imagePreviewWrap}>
                <p className={styles.formHint}>Selected image preview</p>
                <img src={productImageUrl} alt="Selected product preview" className={styles.imagePreview} />
              </div>
            ) : (
              <p className={styles.formHint}>Image is required. Please upload from your gallery.</p>
            )}
            {productImageUrl ? (
              <button
                type="button"
                className={styles.narrowButton}
                onClick={() => setProductImageUrl("")}
              >
                Remove image
              </button>
            ) : null}
            <input
              type="hidden"
              name="imageUrlRequired"
              value={productImageUrl}
              required
            />
            <select
              required
              value={productCategoryId}
              onChange={(event) =>
                setProductCategoryId(event.target.value ? Number(event.target.value) : "")
              }
            >
              <option value="">Select category</option>
              {sortedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </option>
              ))}
            </select>
            <label className={styles.saleToggle}>
              <input
                type="checkbox"
                checked={productIsOnSale}
                onChange={(event) => setProductIsOnSale(event.target.checked)}
              />
              <span>
                <strong>Mark as Sale product</strong>
                <small className={styles.formHint}>This product will appear in the SALE page.</small>
              </span>
            </label>

            <div className={styles.actions}>
              <button type="submit">
                {editingProductId ? "Update product" : "Create product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionHeading}>Products by category</h2>
        {products.length === 0 ? <p>No products yet.</p> : null}

        <div className={styles.manageCategoryTabs}>
          <button
            type="button"
            className={`${styles.manageCategoryTab} ${
              activeManageCategoryId === "all" ? styles.manageCategoryTabActive : ""
            }`}
            onClick={() => setActiveManageCategoryId("all")}
          >
            All categories
          </button>
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.manageCategoryTab} ${
                activeManageCategoryId === category.id ? styles.manageCategoryTabActive : ""
              }`}
              onClick={() => setActiveManageCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {visibleCategoryGroups.map(({ category, items }) => (
          <section key={category.id} className={styles.categoryGroup}>
            <div className={styles.categoryHeadingRow}>
              <h3 className={styles.categoryHeading}>
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              </h3>
              <span className={styles.categoryCount}>
                {items.length} {items.length === 1 ? "product" : "products"}
              </span>
            </div>

            {items.length === 0 ? (
              <p className={styles.emptyCategoryText}>No products in this category yet.</p>
            ) : (
              <div className={styles.list}>
                {items.map((product) => (
                  <article key={product.id} className={styles.row}>
                    <h4>
                      {product.name} - ${product.price.toFixed(2)}
                    </h4>
                    <p className={styles.metaText}>
                      Category: {product.categoryName ?? `ID ${product.categoryId}`}
                    </p>
                    {product.isOnSale ? <p className={styles.saleTag}>SALE TAGGED</p> : null}
                    {product.description ? <p className={styles.metaText}>{product.description}</p> : null}
                    <div className={styles.actions}>
                      <button type="button" onClick={() => onEditProduct(product)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => onDeleteProduct(product.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </section>
      </main>
    </AdminShell>
  );
}
