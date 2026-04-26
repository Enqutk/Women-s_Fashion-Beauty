"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "auth_token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
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

  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const selectedCategoryExists = useMemo(
    () => categories.some((category) => category.id === productCategoryId),
    [categories, productCategoryId],
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
    setStatus("Editing selected product");
    setError(null);
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Admin Product Management</h1>
      <p>Use an admin account token in localStorage to create, update, and delete products.</p>

      {status ? <p style={{ color: "green", marginTop: "0.75rem" }}>{status}</p> : null}
      {error ? <p style={{ color: "crimson", marginTop: "0.75rem" }}>{error}</p> : null}

      <section style={{ marginTop: "1.2rem", border: "1px solid #ddd", padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.8rem" }}>Add category</h2>
        <form onSubmit={onCreateCategory} style={{ display: "grid", gap: "0.6rem" }}>
          <input
            required
            placeholder="Category name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            style={{ padding: "0.55rem" }}
          />
          <input
            placeholder="Category description (optional)"
            value={categoryDescription}
            onChange={(event) => setCategoryDescription(event.target.value)}
            style={{ padding: "0.55rem" }}
          />
          <button type="submit" style={{ padding: "0.55rem", width: 180 }}>
            Create category
          </button>
        </form>
      </section>

      <section style={{ marginTop: "1.2rem", border: "1px solid #ddd", padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.8rem" }}>
          {editingProductId ? "Edit product" : "Add product"}
        </h2>
        <form onSubmit={onCreateOrUpdateProduct} style={{ display: "grid", gap: "0.6rem" }}>
          <input
            required
            placeholder="Product name"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            style={{ padding: "0.55rem" }}
          />
          <textarea
            placeholder="Description"
            value={productDescription}
            onChange={(event) => setProductDescription(event.target.value)}
            style={{ padding: "0.55rem", minHeight: 80 }}
          />
          <input
            required
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Price"
            value={productPrice}
            onChange={(event) => setProductPrice(event.target.value)}
            style={{ padding: "0.55rem" }}
          />
          <input
            placeholder="Image URL (optional)"
            value={productImageUrl}
            onChange={(event) => setProductImageUrl(event.target.value)}
            style={{ padding: "0.55rem" }}
          />
          <select
            required
            value={productCategoryId}
            onChange={(event) =>
              setProductCategoryId(event.target.value ? Number(event.target.value) : "")
            }
            style={{ padding: "0.55rem" }}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button type="submit" style={{ padding: "0.55rem 0.8rem" }}>
              {editingProductId ? "Update product" : "Create product"}
            </button>
            {editingProductId ? (
              <button
                type="button"
                style={{ padding: "0.55rem 0.8rem" }}
                onClick={() => {
                  setEditingProductId(null);
                  setProductName("");
                  setProductDescription("");
                  setProductPrice("");
                  setProductImageUrl("");
                  setProductCategoryId("");
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section style={{ marginTop: "1.2rem", border: "1px solid #ddd", padding: "1rem" }}>
        <h2 style={{ marginBottom: "0.8rem" }}>All products</h2>
        {products.length === 0 ? <p>No products yet.</p> : null}

        <div style={{ display: "grid", gap: "0.8rem" }}>
          {products.map((product) => (
            <article
              key={product.id}
              style={{ border: "1px solid #eee", borderRadius: 6, padding: "0.8rem" }}
            >
              <h3>
                {product.name} - ${product.price.toFixed(2)}
              </h3>
              <p style={{ marginTop: "0.35rem" }}>
                Category: {product.categoryName ?? `ID ${product.categoryId}`}
              </p>
              {product.description ? <p style={{ marginTop: "0.35rem" }}>{product.description}</p> : null}
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem" }}>
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
  );
}
