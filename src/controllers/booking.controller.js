import Razorpay from "razorpay";
import Package from "../models/Package.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { packageId, participants } = req.body;

    if (!packageId || !participants || participants.length === 0) {
      return res.status(400).json({ message: "Package ID and participants are required" });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const amount = pkg.finalPrice * participants.length * 100; // amount in paise

    const options = {
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({ orderId: order.id, amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Confirm payment and create booking
export const confirmPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, packageId, participants } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !packageId || !participants) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const amount = pkg.finalPrice * participants.length;

    const booking = await Booking.create({
      user: req.user.id,
      package: packageId,
      participants,
      amount,
      paymentStatus: "paid",
    });

    // Update bookings count
    pkg.bookingsCount += participants.length;
    await pkg.save();

    res.status(201).json({ message: "Booking confirmed", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Get all bookings for the logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("package", "title finalPrice duration")
      .sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
