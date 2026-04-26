import { Request, Response } from "express";
import { getUserOrders, placeOrder } from "./order.service";
import { validatePlaceOrderRequest } from "./order.validation";

function getUserId(req: Request): number | null {
  return req.authUser?.id ?? null;
}

export async function placeOrderController(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    validatePlaceOrderRequest();
    const order = await placeOrder(userId);
    res.status(201).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    const status = message.includes("Cart is empty") ? 400 : 400;
    res.status(status).json({ ok: false, message });
  }
}

export async function getUserOrdersController(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ ok: false, message: "Unauthorized" });
    return;
  }

  const orders = await getUserOrders(userId);
  res.json(orders);
}
