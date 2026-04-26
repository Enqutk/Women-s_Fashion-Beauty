export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
};

export type UpdateProductInput = {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: number;
};
