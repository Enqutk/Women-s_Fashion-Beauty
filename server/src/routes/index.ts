import { Router } from "express";
import analyticsRoutes from "../modules/analytics";
import authRoutes from "../modules/auth";
import cartRoutes from "../modules/cart";
import categoryRoutes from "../modules/category";
import healthRoutes from "../modules/health";
import orderRoutes from "../modules/order";
import productRoutes from "../modules/product";
import userRoutes from "../modules/user";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin/analytics", analyticsRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/admin/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;
