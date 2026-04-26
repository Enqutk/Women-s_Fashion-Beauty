import { pool } from "../../config/db";
import type { CreateProductInput, Product, UpdateProductInput } from "./product.model";

type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  category_id: number;
  category_name: string | null;
  created_at: string;
  updated_at: string;
};

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    categoryId: row.category_id,
    categoryName: row.category_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureProductsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL CHECK (price > 0),
      image_url TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { rows } = await pool.query<ProductRow>(
    `INSERT INTO products (name, description, price, image_url, category_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, price, image_url, category_id,
       (SELECT name FROM categories WHERE id = category_id) AS category_name,
       created_at, updated_at`,
    [input.name, input.description ?? null, input.price, input.imageUrl ?? null, input.categoryId],
  );

  return mapProductRow(rows[0]);
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT p.id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            p.category_id,
            c.name AS category_name,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ORDER BY p.id DESC`,
  );
  return rows.map(mapProductRow);
}

export async function getProductById(id: number): Promise<Product | null> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT p.id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            p.category_id,
            c.name AS category_name,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ? mapProductRow(rows[0]) : null;
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<Product | null> {
  const current = await getProductById(id);
  if (!current) {
    return null;
  }

  const { rows } = await pool.query<ProductRow>(
    `UPDATE products
     SET name = $1,
         description = $2,
         price = $3,
         image_url = $4,
         category_id = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, name, description, price, image_url, category_id,
       (SELECT name FROM categories WHERE id = category_id) AS category_name,
       created_at, updated_at`,
    [
      input.name ?? current.name,
      input.description ?? current.description,
      input.price ?? current.price,
      input.imageUrl ?? current.imageUrl,
      input.categoryId ?? current.categoryId,
      id,
    ],
  );

  return rows[0] ? mapProductRow(rows[0]) : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function countProducts(): Promise<number> {
  const { rows } = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM products`,
  );
  return Number(rows[0]?.total ?? 0);
}
