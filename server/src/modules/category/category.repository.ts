import { pool } from "../../config/db";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "./category.model";

type CategoryRow = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureCategoriesTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL,
      description VARCHAR(300),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    INSERT INTO categories (name, description)
    VALUES
      ('clothing', 'Women clothing and outfits'),
      ('bags', 'Handbags, totes, and crossbody styles'),
      ('shoes', 'Heels, flats, sneakers, and footwear'),
      ('beauty', 'Beauty essentials and cosmetics'),
      ('perfume', 'Fragrances and scented products'),
      ('accessories', 'Jewelry, sunglasses, and small fashion accessories'),
      ('skincare', 'Cleansers, serums, moisturizers, and treatment products'),
      ('makeup', 'Face, eye, and lip makeup essentials')
    ON CONFLICT (name) DO NOTHING;
  `);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { rows } = await pool.query<CategoryRow>(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at, updated_at`,
    [input.name, input.description ?? null],
  );

  return mapCategoryRow(rows[0]);
}

export async function listCategories(): Promise<Category[]> {
  const { rows } = await pool.query<CategoryRow>(
    `SELECT id, name, description, created_at, updated_at
     FROM categories
     ORDER BY id DESC`,
  );
  return rows.map(mapCategoryRow);
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const { rows } = await pool.query<CategoryRow>(
    `SELECT id, name, description, created_at, updated_at
     FROM categories
     WHERE id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ? mapCategoryRow(rows[0]) : null;
}

export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const current = await getCategoryById(id);
  if (!current) {
    return null;
  }

  const { rows } = await pool.query<CategoryRow>(
    `UPDATE categories
     SET name = $1,
         description = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, description, created_at, updated_at`,
    [input.name ?? current.name, input.description ?? current.description, id],
  );

  return rows[0] ? mapCategoryRow(rows[0]) : null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}
