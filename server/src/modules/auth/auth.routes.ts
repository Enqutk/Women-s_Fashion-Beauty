import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import { createRateLimiter } from "../../middleware/security.middleware";
import {
  getAdminOnlyStatus,
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.controller";

const router = Router();
const authWriteRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  keyPrefix: "auth",
});

router.post("/register", authWriteRateLimiter, registerUser);
router.post("/login", authWriteRateLimiter, loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/admin-only", authenticateToken, requireRole("admin"), getAdminOnlyStatus);

export default router;
