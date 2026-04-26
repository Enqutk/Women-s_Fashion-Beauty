import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "./category.repository";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "./category.model";

export async function createCategoryService(input: CreateCategoryInput): Promise<Category> {
  return createCategory(input);
}

export async function listCategoriesService(): Promise<Category[]> {
  return listCategories();
}

export async function updateCategoryService(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  return updateCategory(id, input);
}

export async function deleteCategoryService(id: number): Promise<boolean> {
  return deleteCategory(id);
}

export async function getCategoryByIdService(id: number): Promise<Category | null> {
  return getCategoryById(id);
}
