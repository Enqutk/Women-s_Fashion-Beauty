import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryController,
} from "./category.controller";

const router = Router();

router.get("/", listCategoriesController);
router.post("/", authenticateToken, requireRole("admin"), createCategoryController);
router.put("/:id", authenticateToken, requireRole("admin"), updateCategoryController);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteCategoryController);

export default router;
