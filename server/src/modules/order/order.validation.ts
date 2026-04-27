import { z } from "zod";

const placeOrderSchema = z.object({}).strict();

const updateStatusSchema = z
  .object({
    status: z.enum(["pending", "completed", "cancelled"]),
  })
  .strict();

export function validatePlaceOrderRequest(input: unknown): void {
  placeOrderSchema.parse(input ?? {});
}

export function validateOrderStatusInput(input: unknown): "pending" | "completed" | "cancelled" {
  return updateStatusSchema.parse(input).status;
}
