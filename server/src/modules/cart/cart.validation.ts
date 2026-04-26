import { z } from "zod";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.model";

const addItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export function validateAddCartItemInput(input: unknown): AddCartItemInput {
  return addItemSchema.parse(input);
}

export function validateUpdateCartItemInput(input: unknown): UpdateCartItemInput {
  return updateItemSchema.parse(input);
}
