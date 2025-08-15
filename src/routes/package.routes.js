import express from "express";
import {
  createPackage,
  getPackages,
  getPackage,
  updatePackage,
  deletePackage,
} from "../controllers/package.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage(); // store in memory, not file system
const upload = multer({ storage });
// Routes
router.post("/admin/", authMiddleware, adminMiddleware, upload.array("images", 5), createPackage);
router.put("/admin/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updatePackage);
router.get("/", getPackages);
router.get("/:id", authMiddleware, getPackage);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deletePackage);

export default router;
