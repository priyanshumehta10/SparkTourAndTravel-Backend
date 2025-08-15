import express from "express";
import { signup, login, updateUser, getAllUsers, getUserById, deleteUser, forgotPassword , resetPassword, logout} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multer from "multer";
const upload = multer();
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/admin/:id",authMiddleware ,adminMiddleware , updateUser);
router.get("/admin/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/admin/users/:id", authMiddleware, adminMiddleware, getUserById);
router.delete("/admin/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout)

export default router;
