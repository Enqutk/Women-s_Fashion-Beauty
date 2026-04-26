export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryName: string | null;
  quantity: number;
  lineTotal: number;
};

export type CartResponse = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
};
