import { pool } from "../../config/db";
import type { AddCartItemInput, CartItem, UpdateCartItemInput } from "./cart.model";

type CartRow = {
  product_id: number;
  product_name: string;
  price: string;
  image_url: string | null;
  category_name: string | null;
  quantity: number;
};

function mapCartRow(row: CartRow): CartItem {
  const price = Number(row.price);
  return {
    productId: row.product_id,
    name: row.product_name,
    price,
    imageUrl: row.image_url,
    categoryName: row.category_name,
    quantity: row.quantity,
    lineTotal: Number((price * row.quantity).toFixed(2)),
  };
}

export async function ensureCartItemsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, product_id)
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS cart_items_user_created_idx
    ON cart_items (user_id, created_at DESC);
  `);
}

export async function getCartItemsByUserId(userId: number): Promise<CartItem[]> {
  const { rows } = await pool.query<CartRow>(
    `SELECT ci.product_id,
            p.name AS product_name,
            p.price,
            p.image_url,
            c.name AS category_name,
            ci.quantity
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId],
  );

  return rows.map(mapCartRow);
}

export async function upsertCartItem(userId: number, input: AddCartItemInput): Promise<void> {
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                   updated_at = NOW()`,
    [userId, input.productId, input.quantity],
  );
}

export async function updateCartItem(
  userId: number,
  productId: number,
  input: UpdateCartItemInput,
): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE cart_items
     SET quantity = $1, updated_at = NOW()
     WHERE user_id = $2 AND product_id = $3`,
    [input.quantity, userId, productId],
  );

  return (rowCount ?? 0) > 0;
}

export async function removeCartItem(userId: number, productId: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,
    [userId, productId],
  );

  return (rowCount ?? 0) > 0;
}

export async function clearCartByUserId(userId: number): Promise<void> {
  await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
}
