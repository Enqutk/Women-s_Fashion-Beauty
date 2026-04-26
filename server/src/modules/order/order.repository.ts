import { pool } from "../../config/db";
import type { Order, OrderItem, OrderStatus } from "./order.model";

type OrderRow = {
  id: number;
  user_id: number;
  status: string;
  total: string;
  created_at: string;
};

type OrderItemRow = {
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
};

function mapOrderItem(row: OrderItemRow): OrderItem {
  const unitPrice = Number(row.unit_price);
  return {
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice,
    lineTotal: Number((unitPrice * row.quantity).toFixed(2)),
  };
}

function mapOrderRow(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    userId: row.user_id,
    status: (row.status as OrderStatus) ?? "pending",
    total: Number(row.total),
    createdAt: row.created_at,
    items,
  };
}

export async function ensureOrdersTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      product_name VARCHAR(160) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
    );
  `);
}

export async function createOrderWithItems(input: {
  userId: number;
  total: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}): Promise<Order> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query<OrderRow>(
      `INSERT INTO orders (user_id, total, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, user_id, status, total, created_at`,
      [input.userId, input.total],
    );
    const createdOrder = orderResult.rows[0];

    for (const item of input.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [createdOrder.id, item.productId, item.productName, item.quantity, item.unitPrice],
      );
    }

    await client.query("COMMIT");

    return mapOrderRow(
      createdOrder,
      input.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: Number((item.unitPrice * item.quantity).toFixed(2)),
      })),
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrdersByUserId(userId: number): Promise<Order[]> {
  const { rows: orderRows } = await pool.query<OrderRow>(
    `SELECT id, user_id, status, total, created_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((row) => row.id);
  const { rows: itemRows } = await pool.query<OrderItemRow>(
    `SELECT order_id, product_id, product_name, quantity, unit_price
     FROM order_items
     WHERE order_id = ANY($1::int[])
     ORDER BY id ASC`,
    [orderIds],
  );

  const itemsByOrderId = new Map<number, OrderItem[]>();
  for (const row of itemRows) {
    const current = itemsByOrderId.get(row.order_id) ?? [];
    current.push(mapOrderItem(row));
    itemsByOrderId.set(row.order_id, current);
  }

  return orderRows.map((row) => mapOrderRow(row, itemsByOrderId.get(row.id) ?? []));
}
