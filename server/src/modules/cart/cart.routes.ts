import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import {
  addCartItemController,
  getCartController,
  removeCartItemController,
  updateCartItemController,
} from "./cart.controller";

const router = Router();

router.use(authenticateToken);
router.get("/", getCartController);
router.post("/items", addCartItemController);
router.patch("/items/:productId", updateCartItemController);
router.delete("/items/:productId", removeCartItemController);

export default router;
