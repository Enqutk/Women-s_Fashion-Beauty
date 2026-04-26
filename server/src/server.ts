import app from "./app";
import { ensureCartItemsTable } from "./modules/cart/cart.repository";
import { checkDatabaseConnection } from "./config/db";
import { ensureCategoriesTable } from "./modules/category/category.repository";
import { ensureOrdersTables } from "./modules/order/order.repository";
import { ensureProductsTable } from "./modules/product/product.repository";
import { ensureUsersTable } from "./modules/user/user.repository";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();
    await ensureUsersTable();
    await ensureCategoriesTable();
    await ensureProductsTable();
    await ensureCartItemsTable();
    await ensureOrdersTables();
    app.listen(env.port, () => {
      // Keep startup log concise for sprint 0 verification.
      console.log(`API server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
}

void startServer();
