import { Request, Response } from "express";
import { getAllOrders, getUserOrders, placeOrder, updateOrderStatusService } from "./order.service";
import { validateOrderStatusInput, validatePlaceOrderRequest } from "./order.validation";
import { getAuthUserId, parsePositiveIntParam } from "../../utils/request.utils";

export async function placeOrderController(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    validatePlaceOrderRequest(req.body);
    const order = await placeOrder(userId);
    res.status(201).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    const status = message.includes("Cart is empty") ? 400 : 400;
    res.status(status).json({ ok: false, message });
  }
}

export async function getUserOrdersController(req: Request, res: Response): Promise<void> {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ ok: false, message: "Unauthorized" });
    return;
  }

  const orders = await getUserOrders(userId);
  res.json(orders);
}

export async function getAllOrdersController(_req: Request, res: Response): Promise<void> {
  const orders = await getAllOrders();
  res.json(orders);
}

export async function updateOrderStatusController(req: Request, res: Response): Promise<void> {
  try {
    const orderId = parsePositiveIntParam(req.params.id);
    if (!orderId) {
      res.status(400).json({ ok: false, message: "Invalid order id" });
      return;
    }

    const status = validateOrderStatusInput(req.body);
    const updatedOrder = await updateOrderStatusService(orderId, status);
    if (!updatedOrder) {
      res.status(404).json({ ok: false, message: "Order not found" });
      return;
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update order status",
    });
  }
}
