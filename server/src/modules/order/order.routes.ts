import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import {
  getAllOrdersController,
  getUserOrdersController,
  placeOrderController,
  updateOrderStatusController,
} from "./order.controller";

const router = Router();

router.use(authenticateToken);
router.post("/", placeOrderController);
router.get("/", getUserOrdersController);
router.get("/admin", requireRole("admin"), getAllOrdersController);
router.patch("/admin/:id/status", requireRole("admin"), updateOrderStatusController);

export default router;
