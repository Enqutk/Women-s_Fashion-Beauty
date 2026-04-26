import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import {
  getAdminOnlyStatus,
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/admin-only", authenticateToken, requireRole("admin"), getAdminOnlyStatus);

export default router;
