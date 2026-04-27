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
  is_on_sale: boolean;
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
    isOnSale: row.is_on_sale,
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
      is_on_sale BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN NOT NULL DEFAULT false;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS products_category_id_idx
    ON products (category_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS products_created_at_idx
    ON products (created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS products_is_on_sale_idx
    ON products (is_on_sale);
  `);

  await pool.query(`
    INSERT INTO products (name, description, price, image_url, category_id, is_on_sale)
    SELECT p.name, p.description, p.price, p.image_url, c.id, p.is_on_sale
    FROM (
      VALUES
        ('Silk Wrap Midi Dress', 'Elegant satin midi dress with soft drape and waist tie.', 79.99::numeric, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Tailored Blazer Set', 'Structured blazer and pants set for office or occasion wear.', 119.00::numeric, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'clothing', true),
        ('Everyday Ribbed Top', 'Stretch ribbed top with premium cotton blend comfort.', 29.50::numeric, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Classic Leather Tote', 'Spacious leather tote for work, travel, and daily essentials.', 95.00::numeric, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Mini Crossbody Bag', 'Compact crossbody with adjustable strap and gold hardware.', 54.00::numeric, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'bags', true),
        ('Woven Summer Handbag', 'Lightweight woven texture handbag with magnetic closure.', 49.99::numeric, 'https://images.unsplash.com/photo-1591561954555-607968c989ab?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Pointed Heel Pumps', 'Polished pointed toe pumps for events and office looks.', 68.75::numeric, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Street Sneaker White', 'Minimal everyday sneaker with cushioned sole.', 72.00::numeric, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80', 'shoes', true),
        ('Ankle Strap Sandals', 'Comfort strap sandals with soft padded insole.', 45.00::numeric, 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Hydrating Face Cream', 'Daily moisturizer with hyaluronic acid for smooth glow.', 24.99::numeric, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Velvet Matte Lip Kit', 'Long-wear matte lip color with matching liner.', 21.00::numeric, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80', 'makeup', true),
        ('Glow Foundation SPF', 'Buildable medium coverage with natural finish and SPF.', 32.00::numeric, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Vitamin C Serum', 'Brightening serum designed to even tone and boost radiance.', 27.50::numeric, 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80', 'skincare', true),
        ('Gentle Foam Cleanser', 'Daily cleanser that removes impurities without drying skin.', 18.00::numeric, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Rose Oud Perfume', 'Warm rose oud fragrance with rich amber notes.', 64.00::numeric, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80', 'perfume', true),
        ('Citrus Bloom Eau De Parfum', 'Fresh floral-citrus blend for everyday elegance.', 58.00::numeric, 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Gold Hoop Earrings', 'Polished lightweight hoops for daily styling.', 16.00::numeric, 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Oval Sunglasses', 'UV-protected retro sunglasses with slim metal frame.', 22.00::numeric, 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80', 'accessories', false)
    ) AS p(name, description, price, image_url, category_name, is_on_sale)
    JOIN categories c ON c.name = p.category_name
    WHERE NOT EXISTS (SELECT 1 FROM products);
  `);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { rows } = await pool.query<ProductRow>(
    `INSERT INTO products (name, description, price, image_url, category_id, is_on_sale)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, description, price, image_url, category_id, is_on_sale,
       (SELECT name FROM categories WHERE id = category_id) AS category_name,
       created_at, updated_at`,
    [
      input.name,
      input.description ?? null,
      input.price,
      input.imageUrl ?? null,
      input.categoryId,
      input.isOnSale ?? false,
    ],
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
            p.is_on_sale,
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
            p.is_on_sale,
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
         is_on_sale = $6,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, name, description, price, image_url, category_id, is_on_sale,
       (SELECT name FROM categories WHERE id = category_id) AS category_name,
       created_at, updated_at`,
    [
      input.name ?? current.name,
      input.description ?? current.description,
      input.price ?? current.price,
      input.imageUrl ?? current.imageUrl,
      input.categoryId ?? current.categoryId,
      input.isOnSale ?? current.isOnSale,
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
