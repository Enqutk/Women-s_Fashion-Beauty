import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import { getDashboardAnalyticsController } from "./analytics.controller";

const router = Router();

router.use(authenticateToken, requireRole("admin"));
router.get("/", getDashboardAnalyticsController);

export default router;
