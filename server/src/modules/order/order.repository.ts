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
    CREATE INDEX IF NOT EXISTS orders_user_created_idx
    ON orders (user_id, created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS orders_status_idx
    ON orders (status);
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
  await pool.query(`
    CREATE INDEX IF NOT EXISTS order_items_order_id_idx
    ON order_items (order_id);
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

export async function listAllOrders(): Promise<Order[]> {
  const { rows: orderRows } = await pool.query<OrderRow>(
    `SELECT id, user_id, status, total, created_at
     FROM orders
     ORDER BY created_at DESC`,
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

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
): Promise<Order | null> {
  const { rowCount } = await pool.query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2`,
    [status, orderId],
  );

  if ((rowCount ?? 0) === 0) {
    return null;
  }

  const { rows: orderRows } = await pool.query<OrderRow>(
    `SELECT id, user_id, status, total, created_at
     FROM orders
     WHERE id = $1
     LIMIT 1`,
    [orderId],
  );

  if (!orderRows[0]) {
    return null;
  }

  const { rows: itemRows } = await pool.query<OrderItemRow>(
    `SELECT order_id, product_id, product_name, quantity, unit_price
     FROM order_items
     WHERE order_id = $1
     ORDER BY id ASC`,
    [orderId],
  );

  return mapOrderRow(orderRows[0], itemRows.map(mapOrderItem));
}

export async function countOrders(): Promise<number> {
  const { rows } = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM orders`,
  );
  return Number(rows[0]?.total ?? 0);
}

export async function getOrderStatusBreakdown(): Promise<
  Array<{ status: "pending" | "completed" | "cancelled"; count: number }>
> {
  const { rows } = await pool.query<{ status: string; total: string }>(
    `SELECT status, COUNT(*)::text AS total
     FROM orders
     GROUP BY status`,
  );

  const defaultMap: Record<"pending" | "completed" | "cancelled", number> = {
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const row of rows) {
    if (row.status === "pending" || row.status === "completed" || row.status === "cancelled") {
      defaultMap[row.status] = Number(row.total);
    }
  }

  return [
    { status: "pending", count: defaultMap.pending },
    { status: "completed", count: defaultMap.completed },
    { status: "cancelled", count: defaultMap.cancelled },
  ];
}
