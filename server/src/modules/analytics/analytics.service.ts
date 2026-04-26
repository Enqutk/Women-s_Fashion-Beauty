import { countOrders, getOrderStatusBreakdown } from "../order/order.repository";
import { countProducts } from "../product/product.repository";
import { countUsers } from "../user/user.repository";
import type { DashboardAnalytics } from "./analytics.model";

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [totalUsers, totalOrders, totalProducts, orderStatusBreakdown] = await Promise.all([
    countUsers(),
    countOrders(),
    countProducts(),
    getOrderStatusBreakdown(),
  ]);

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    orderStatusBreakdown,
  };
}
