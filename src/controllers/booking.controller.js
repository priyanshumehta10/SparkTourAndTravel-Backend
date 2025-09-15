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
    const { 
      packageId, 
      participants, 
      contactEmail, 
      contactPhone, 
      amount, 
      paymentType,   
      startingDate   
    } = req.body;

    // ✅ Validation
    if (!packageId) return res.status(400).json({ message: "Package ID is required" });
    if (!participants || participants.length === 0) return res.status(400).json({ message: "At least one participant is required" });
    if (!contactEmail) return res.status(400).json({ message: "Contact email is required" });
    if (!contactPhone) return res.status(400).json({ message: "Contact phone is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    if (!paymentType || !["50", "100"].includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type (must be '50' or '100')" });
    }
    if (!startingDate) return res.status(400).json({ message: "Starting date is required" });

    // ✅ Define totalAmount
    let totalAmount = amount; 

    if (paymentType === "50") {
      totalAmount = amount * 2; // full package value
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    let paidAmount = 0;

    // ✅ Create Razorpay order
    const options = {
      amount: amount * 100, // convert rupees to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // ✅ Save booking
    const booking = await Booking.create({
      user: req.user.id,
      package: packageId,
      participants,
      contactEmail,
      contactPhone,
      amount,
      totalAmount,
      paidAmount,
      paymentType,    
      startingDate,
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
      paymentType: booking.paymentType,  
      startingDate: booking.startingDate, 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 2️⃣ Confirm payment and update booking
export const confirmPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, bookingId, paymentType } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !bookingId || !paymentType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find booking by Mongo _id (your bookingId)
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // (Optional) verify signature from Razorpay here
      booking.paidAmount = booking.amount

    // ✅ Update payment status
    if (paymentType === "50") {
      booking.paymentStatus = "partial"; // new status for 50% payment
    } else if (paymentType === "100") {
      booking.paymentStatus = "paid"; // full payment
    } else {
      return res.status(400).json({ message: "Invalid paymentType" });
    }

    booking.paymentType = paymentType; // save chosen type
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpayOrderId = razorpayOrderId; 
    await booking.save();

    // ✅ Update package booking count only if fully paid
    if (booking.paymentStatus === "paid") {
      const pkg = await Package.findById(booking.package);
      if (pkg) {
        pkg.bookingsCount += booking.participants.length;
        await pkg.save();
      }
    }

    res.status(201).json({ message: "Payment confirmed", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const getMyBookings = async (req, res) => {
  try {
        console.log(req.params.id);

    const bookings = await Booking.find({ user: req.user.id })
      .populate("package", "title price")
      .sort({ bookedAt: -1 });
    console.log(bookings);

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingDetail = async (req, res) => {
  try {
    console.log(req.params.id);
    
    const booking = await Booking.findById(req.params.id)
      .populate("package", "title price description")
      .populate("user", "name email");
    console.log(booking);
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// PUT /api/bookings/:id/pay
export const payRemaining = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentType !== 50) {
      return res.status(400).json({ message: "Full payment already done" });
    }

    if (booking.paidAmount >= booking.amount) {
      return res.status(400).json({ message: "Booking already fully paid" });
    }

    booking.paidAmount = booking.amount;
    booking.paymentStatus = "paid";

    await booking.save();

    res.json({ success: true, message: "Remaining payment completed", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")             // show user info
      .populate("package", "title price duration") // show package info
      .sort({ bookedAt: -1 });

    res.json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

