import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import { listUsersAdmin } from "./user.controller";

const router = Router();

router.get("/", authenticateToken, requireRole("admin"), listUsersAdmin);

export default router;
