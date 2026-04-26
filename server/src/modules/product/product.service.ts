import { getCategoryByIdService } from "../category/category.service";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "./product.repository";
import type { CreateProductInput, Product, UpdateProductInput } from "./product.model";

export async function createProductService(input: CreateProductInput): Promise<Product> {
  const category = await getCategoryByIdService(input.categoryId);
  if (!category) {
    throw new Error("Category does not exist");
  }
  return createProduct(input);
}

export async function listProductsService(): Promise<Product[]> {
  return listProducts();
}

export async function getProductByIdService(id: number): Promise<Product | null> {
  return getProductById(id);
}

export async function updateProductService(
  id: number,
  input: UpdateProductInput,
): Promise<Product | null> {
  if (input.categoryId !== undefined) {
    const category = await getCategoryByIdService(input.categoryId);
    if (!category) {
      throw new Error("Category does not exist");
    }
  }
  return updateProduct(id, input);
}

export async function deleteProductService(id: number): Promise<boolean> {
  return deleteProduct(id);
}
