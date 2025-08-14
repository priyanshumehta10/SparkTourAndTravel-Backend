import express from "express";
import { signup, login, updateUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/:id",authMiddleware , updateUser);

export default router;
