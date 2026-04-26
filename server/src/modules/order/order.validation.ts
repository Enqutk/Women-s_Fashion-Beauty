export function validatePlaceOrderRequest(): void {
  // Checkout currently places an order from cart only.
}

export function validateOrderStatusInput(input: unknown): "pending" | "completed" | "cancelled" {
  if (
    typeof input === "object" &&
    input !== null &&
    "status" in input &&
    (input as { status: unknown }).status
  ) {
    const value = (input as { status: unknown }).status;
    if (value === "pending" || value === "completed" || value === "cancelled") {
      return value;
    }
  }

  throw new Error("Invalid status. Use pending, completed, or cancelled");
}
