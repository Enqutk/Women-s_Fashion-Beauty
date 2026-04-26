export type DashboardAnalytics = {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  orderStatusBreakdown: Array<{
    status: "pending" | "completed" | "cancelled";
    count: number;
  }>;
};
