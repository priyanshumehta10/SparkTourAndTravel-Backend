import Razorpay from "razorpay";
import Package from "../models/Package.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Razorpay order + create booking with pending status
export const createOrder = async (req, res) => {
  try {
    const { packageId, participants, contactEmail, contactPhone, amount } = req.body;

    // ✅ Validation
    if (!packageId) return res.status(400).json({ message: "Package ID is required" });
    if (!participants || participants.length === 0) return res.status(400).json({ message: "At least one participant is required" });
    if (!contactEmail) return res.status(400).json({ message: "Contact email is required" });
    if (!contactPhone) return res.status(400).json({ message: "Contact phone is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    // ✅ Create Razorpay order
    const options = {
      amount: amount * 100, // convert rupees to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // ✅ Create booking in DB with pending status
    const booking = await Booking.create({
      user: req.user.id,
      package: packageId,
      participants,
      contactEmail,
      contactPhone,
      amount,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
    });

    res.json({
      orderId: order.id,
      bookingId: booking._id,
      packageId: booking.package,
      participants: booking.participants,
      amount: options.amount,
      currency: order.currency,
      contactEmail,
      contactPhone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Confirm payment and update booking
export const confirmPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, bookingId } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !bookingId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find booking by Mongo _id (your bookingId)
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // (Optional) verify signature from Razorpay here

    // ✅ Update booking as paid
    booking.paymentStatus = "paid";
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpayOrderId = razorpayOrderId; // also save for traceability
    await booking.save();

    // ✅ Update package booking count
    const pkg = await Package.findById(booking.package);
    if (pkg) {
      pkg.bookingsCount += booking.participants.length;
      await pkg.save();
    }

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
