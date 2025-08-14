import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
});

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  participants: [participantSchema], // one or multiple people
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  bookedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
