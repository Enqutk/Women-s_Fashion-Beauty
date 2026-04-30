import { clearCartByUserId } from "../cart/cart.repository";
import { getCartByUserId } from "../cart/cart.service";
import { sendOrderPlacedEmail, sendOrderStatusUpdatedEmail } from "../notification/email.service";
import { findUserById } from "../user/user.repository";
import { createOrderWithItems, listAllOrders, listOrdersByUserId, updateOrderStatus } from "./order.repository";
import type { Order } from "./order.model";

export async function placeOrder(userId: number): Promise<Order> {
  const cart = await getCartByUserId(userId);
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const order = await createOrderWithItems({
    userId,
    total: cart.subtotal,
    items: cart.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  });

  await clearCartByUserId(userId);

  const user = await findUserById(userId);
  if (user) {
    void sendOrderPlacedEmail({
      to: user.email,
      customerName: user.name,
      order,
    }).catch((error) => {
      console.error("Failed to send order confirmation email:", error);
    });
  }

  return order;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  return listOrdersByUserId(userId);
}

export async function getAllOrders(): Promise<Order[]> {
  return listAllOrders();
}

export async function updateOrderStatusService(
  orderId: number,
  status: "pending" | "completed" | "cancelled",
): Promise<Order | null> {
  const updatedOrder = await updateOrderStatus(orderId, status);
  if (!updatedOrder) {
    return null;
  }

  const user = await findUserById(updatedOrder.userId);
  if (user) {
    void sendOrderStatusUpdatedEmail({
      to: user.email,
      customerName: user.name,
      order: updatedOrder,
      status,
    }).catch((error) => {
      console.error("Failed to send order status email:", error);
    });
  }

  return updatedOrder;
}
