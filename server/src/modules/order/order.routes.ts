import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { getUserOrdersController, placeOrderController } from "./order.controller";

const router = Router();

router.use(authenticateToken);
router.post("/", placeOrderController);
router.get("/", getUserOrdersController);

export default router;
