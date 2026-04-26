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
  createdAt: string;
  updatedAt: string;
};
