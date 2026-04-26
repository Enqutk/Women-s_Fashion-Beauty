export type Category = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
};
