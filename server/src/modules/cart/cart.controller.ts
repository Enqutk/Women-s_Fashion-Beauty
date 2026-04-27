import { Request, Response } from "express";
import {
  addCartItem,
  changeCartItemQuantity,
  deleteCartItem,
  getCartByUserId,
} from "./cart.service";
import { validateAddCartItemInput, validateUpdateCartItemInput } from "./cart.validation";
import { getAuthUserId, parsePositiveIntParam } from "../../utils/request.utils";

export async function getCartController(req: Request, res: Response): Promise<void> {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ ok: false, message: "Unauthorized" });
    return;
  }

  const cart = await getCartByUserId(userId);
  res.json(cart);
}

export async function addCartItemController(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    const payload = validateAddCartItemInput(req.body);
    const cart = await addCartItem(userId, payload);
    res.status(201).json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add cart item";
    res.status(400).json({ ok: false, message });
  }
}

export async function updateCartItemController(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    const productId = parsePositiveIntParam(req.params.productId);
    if (!productId) {
      res.status(400).json({ ok: false, message: "Invalid product id" });
      return;
    }

    const payload = validateUpdateCartItemInput(req.body);
    const cart = await changeCartItemQuantity(userId, productId, payload);
    res.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update cart item";
    const status = message.includes("not found") ? 404 : 400;
    res.status(status).json({ ok: false, message });
  }
}

export async function removeCartItemController(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    const productId = parsePositiveIntParam(req.params.productId);
    if (!productId) {
      res.status(400).json({ ok: false, message: "Invalid product id" });
      return;
    }

    const cart = await deleteCartItem(userId, productId);
    res.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove cart item";
    const status = message.includes("not found") ? 404 : 400;
    res.status(status).json({ ok: false, message });
  }
}
