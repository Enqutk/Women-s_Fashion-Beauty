import { Request, Response } from "express";
import {
  createCategoryService,
  deleteCategoryService,
  listCategoriesService,
  updateCategoryService,
} from "./category.service";
import {
  validateCreateCategoryInput,
  validateUpdateCategoryInput,
} from "./category.validation";

export async function createCategoryController(req: Request, res: Response): Promise<void> {
  try {
    const payload = validateCreateCategoryInput(req.body);
    const category = await createCategoryService(payload);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create category",
    });
  }
}

export async function listCategoriesController(_req: Request, res: Response): Promise<void> {
  const categories = await listCategoriesService();
  res.json(categories);
}

export async function updateCategoryController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ ok: false, message: "Invalid category id" });
      return;
    }

    const payload = validateUpdateCategoryInput(req.body);
    const category = await updateCategoryService(id, payload);
    if (!category) {
      res.status(404).json({ ok: false, message: "Category not found" });
      return;
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update category",
    });
  }
}

export async function deleteCategoryController(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ ok: false, message: "Invalid category id" });
    return;
  }

  const deleted = await deleteCategoryService(id);
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Category not found" });
    return;
  }

  res.status(204).send();
}
