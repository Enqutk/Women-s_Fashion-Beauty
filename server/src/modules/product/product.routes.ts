import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsController,
  updateProductController,
} from "./product.controller";

const router = Router();

router.get("/", listProductsController);
router.get("/:id", getProductController);
router.post("/", authenticateToken, requireRole("admin"), createProductController);
router.put("/:id", authenticateToken, requireRole("admin"), updateProductController);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteProductController);

export default router;
