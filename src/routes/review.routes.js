// routes/review.routes.js
import express from "express";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multer from "multer";

const router = express.Router();
// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Write review
router.post("/admin/", upload.single("image"), authMiddleware, adminMiddleware, createReview);

// Get all reviews
router.get("/", getReviews);

// Delete review
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteReview);

export default router;
