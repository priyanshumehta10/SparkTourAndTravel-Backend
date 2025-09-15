import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
});

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },

  participants: [participantSchema], // multiple participants

  // 👇 Contact info (different from participants)
  contactEmail: { 
    type: String, 
    required: true, 
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"] 
  },
  contactPhone: { 
    type: String, 
    required: true, 
    match: [/^[0-9]{10}$/, "Invalid phone number"] 
  },

  amount: { type: Number, required: true },

  // 👇 New fields
  paidAmount: { type: Number, default: 0 },
  paymentType: { type: String, enum: ["50", "100"], required: true }, 
  startingDate: { type: Date, required: true },

  paymentStatus: { type: String, enum: ["pending","partial", "paid"], default: "pending" },
  bookedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
