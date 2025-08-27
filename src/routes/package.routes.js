import express from "express";
import {
  createPackage,
  getPackages,
  getPackage,
  updatePackage,
  deletePackage,
  getPackagesByGroup,
  getAllTags
} from "../controllers/package.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage });
// Routes
router.post("/admin/", authMiddleware, adminMiddleware, upload.array("images", 5), createPackage);
router.put("/admin/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updatePackage);
router.get("/", getPackages);
router.get("/:id", authMiddleware, getPackage);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deletePackage);
router.get("/group/:id", authMiddleware, adminMiddleware, getPackagesByGroup);
router.get("/tags/all", authMiddleware, getAllTags);

export default router;
