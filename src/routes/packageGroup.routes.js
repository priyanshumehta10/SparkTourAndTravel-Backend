import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    createPackageGroup,
    getPackageGroups,
    getPackageGroup,
    updatePackageGroup,
    deletePackageGroup,
} from "../controllers/packageGroup.controller.js";

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post(
    "/admin/",
    authMiddleware,
    adminMiddleware,
    upload.single("photo"), 
    createPackageGroup
);

router.put(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    upload.single("photo"),
    updatePackageGroup
);

router.get("/", getPackageGroups);
router.get("/:id",authMiddleware, getPackageGroup);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deletePackageGroup);

export default router;
