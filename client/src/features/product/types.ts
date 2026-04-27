export type Category = {
  id: number;
  name: string;
  description: string | null;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  isOnSale: boolean;
  createdAt: string;
  updatedAt: string;
};
