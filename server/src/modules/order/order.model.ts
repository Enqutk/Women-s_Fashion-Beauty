export type OrderStatus = "pending" | "completed" | "cancelled";

export type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
};
