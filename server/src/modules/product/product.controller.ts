import { Request, Response } from "express";
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  listProductsService,
  updateProductService,
} from "./product.service";
import { validateCreateProductInput, validateUpdateProductInput } from "./product.validation";
import { parsePositiveIntParam } from "../../utils/request.utils";

export async function createProductController(req: Request, res: Response): Promise<void> {
  try {
    const payload = validateCreateProductInput(req.body);
    const product = await createProductService(payload);
    res.status(201).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    const status = message.includes("Category does not exist") ? 400 : 400;
    res.status(status).json({ ok: false, message });
  }
}

export async function listProductsController(_req: Request, res: Response): Promise<void> {
  const products = await listProductsService();
  res.json(products);
}

export async function getProductController(req: Request, res: Response): Promise<void> {
  const id = parsePositiveIntParam(req.params.id);
  if (!id) {
    res.status(400).json({ ok: false, message: "Invalid product id" });
    return;
  }
  const product = await getProductByIdService(id);
  if (!product) {
    res.status(404).json({ ok: false, message: "Product not found" });
    return;
  }
  res.json(product);
}

export async function updateProductController(req: Request, res: Response): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id);
    if (!id) {
      res.status(400).json({ ok: false, message: "Invalid product id" });
      return;
    }

    const payload = validateUpdateProductInput(req.body);
    const product = await updateProductService(id, payload);
    if (!product) {
      res.status(404).json({ ok: false, message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    res.status(400).json({ ok: false, message });
  }
}

export async function deleteProductController(req: Request, res: Response): Promise<void> {
  const id = parsePositiveIntParam(req.params.id);
  if (!id) {
    res.status(400).json({ ok: false, message: "Invalid product id" });
    return;
  }
  const deleted = await deleteProductService(id);
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Product not found" });
    return;
  }
  res.status(204).send();
}
