import express from "express";
import { getDashboardSummary } from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// GET /api/dashboard/summary
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardSummary);

export default router;
