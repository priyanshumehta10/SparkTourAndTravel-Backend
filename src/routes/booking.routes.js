import express from "express";
import { createOrder, confirmPayment, getMyBookings, payRemaining, getAllBookings } from "../controllers/booking.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create Razorpay order
router.post("/createOrder", createOrder);

// Confirm payment & create booking
router.post("/confirmPayment", confirmPayment);

// Get all bookings for logged-in user
router.get("/:id", getMyBookings);

router.post("/remainPayment/:id", payRemaining);

router.get("/admin/get", getAllBookings);


export default router;
