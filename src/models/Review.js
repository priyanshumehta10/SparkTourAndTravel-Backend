// models/review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    star: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    image: {
      url: { type: String },
      public_id: { type: String },
    },

  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
