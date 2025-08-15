import express from "express";
import { createInquiry, getInquiries, deleteInquiry } from "../controllers/inquiry.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/", createInquiry);
router.get("/admin/",authMiddleware, adminMiddleware, getInquiries);
router.delete("/admin/:id",authMiddleware, adminMiddleware, deleteInquiry);

export default router;
