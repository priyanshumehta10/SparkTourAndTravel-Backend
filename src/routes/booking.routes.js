import express from "express";
import { createOrder, confirmPayment, getUserBookings } from "../controllers/booking.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create Razorpay order
router.post("/create-order", createOrder);

// Confirm payment & create booking
router.post("/confirm-payment", confirmPayment);

// Get all bookings for logged-in user
router.get("/", getUserBookings);

export default router;
