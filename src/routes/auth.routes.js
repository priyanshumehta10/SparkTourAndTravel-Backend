import express from "express";
import { signup, login, updateUser, getAllUsers, getUserById, deleteUser, forgotPassword , resetPassword, logout} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multer from "multer";
import User from "../models/User.js";
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
router.post("/logout",authMiddleware, logout)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User is logged in",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Check login error:", err);
    res.status(500).json({ message: "Server error while checking login" });
  }
});


export default router;
