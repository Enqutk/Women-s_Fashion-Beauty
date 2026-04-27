"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

  const selectedCategoryExists = useMemo(
    () => categories.some((category) => category.id === productCategoryId),
    [categories, productCategoryId],
  );
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
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

    const payload = {
      name: productName,
      description: productDescription || undefined,
      price: Number(productPrice),
      imageUrl: productImageUrl || undefined,
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
        <h2 className={styles.sectionHeading}>Add category</h2>
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
      </section>

      <section className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionHeading}>
          {editingProductId ? "Edit product" : "Add product"}
        </h2>
        <form onSubmit={onCreateOrUpdateProduct} className={styles.formGrid}>
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
            style={{ minHeight: 80 }}
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
            placeholder="Image URL (optional)"
            value={productImageUrl}
            onChange={(event) => setProductImageUrl(event.target.value)}
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
            {editingProductId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setProductName("");
                  setProductDescription("");
                  setProductPrice("");
                  setProductImageUrl("");
                  setProductCategoryId("");
                  setProductIsOnSale(false);
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className={`${styles.section} ${styles.card}`}>
        <h2 className={styles.sectionHeading}>All products</h2>
        {products.length === 0 ? <p>No products yet.</p> : null}

        <div className={styles.list}>
          {products.map((product) => (
            <article key={product.id} className={styles.row}>
              <h3>
                {product.name} - ${product.price.toFixed(2)}
              </h3>
              <p style={{ marginTop: "0.35rem" }}>
                Category: {product.categoryName ?? `ID ${product.categoryId}`}
              </p>
              {product.isOnSale ? <p style={{ marginTop: "0.3rem", color: "#b91c1c" }}>SALE TAGGED</p> : null}
              {product.description ? <p style={{ marginTop: "0.35rem" }}>{product.description}</p> : null}
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
      </section>
      </main>
    </AdminShell>
  );
}
