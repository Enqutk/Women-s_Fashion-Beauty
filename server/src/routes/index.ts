import { Router } from "express";
import authRoutes from "../modules/auth";
import cartRoutes from "../modules/cart";
import categoryRoutes from "../modules/category";
import healthRoutes from "../modules/health";
import productRoutes from "../modules/product";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;
