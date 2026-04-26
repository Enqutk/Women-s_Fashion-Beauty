import { z } from "zod";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.model";

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional(),
});

const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(300).optional(),
  })
  .refine((value) => value.name !== undefined || value.description !== undefined, {
    message: "Provide at least one field to update",
  });

export function validateCreateCategoryInput(input: unknown): CreateCategoryInput {
  return createCategorySchema.parse(input);
}

export function validateUpdateCategoryInput(input: unknown): UpdateCategoryInput {
  return updateCategorySchema.parse(input);
}
