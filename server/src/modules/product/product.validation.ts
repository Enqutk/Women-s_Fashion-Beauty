import { z } from "zod";
import type { CreateProductInput, UpdateProductInput } from "./product.model";

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1200).optional(),
  price: z.number().positive(),
  imageUrl: z.string().trim().url().optional(),
  categoryId: z.number().int().positive(),
});

const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().max(1200).optional(),
    price: z.number().positive().optional(),
    imageUrl: z.string().trim().url().optional(),
    categoryId: z.number().int().positive().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.price !== undefined ||
      value.imageUrl !== undefined ||
      value.categoryId !== undefined,
    {
      message: "Provide at least one field to update",
    },
  );

export function validateCreateProductInput(input: unknown): CreateProductInput {
  return createProductSchema.parse(input);
}

export function validateUpdateProductInput(input: unknown): UpdateProductInput {
  return updateProductSchema.parse(input);
}
