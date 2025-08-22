import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number },
  duration: { type: String, required: true },
  images: [
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
],
  Hot:{type: Boolean, default: false},
  itinerary: [itinerarySchema],
  bookingsCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

function arrayLimit(val) {
  return val.length <= 5;
}

packageSchema.pre("save", function (next) {
  if (this.discount > 0) {
    this.finalPrice = this.price - (this.price * this.discount) / 100;
  } else {
    this.finalPrice = this.price;
  }
  next();
});

export default mongoose.model("Package", packageSchema);
