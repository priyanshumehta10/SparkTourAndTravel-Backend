import mongoose from "mongoose";
const TAGS_ENUM = [
  "Popular Destinations",
  "Seasonal Specials",
  "Family-Friendly Tours",
  "Adventure & Treks",
  "Couples & Honeymoon",
  "Budget Friendly Options",
];
const PackageGroup = new mongoose.Schema({
  name: { type: String, required: true },
  photo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  tags: {
    type: [String],
    enum: TAGS_ENUM,
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
    default: [],
  },
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

function arrayLimit(val) {
  return val.length <= 5;
}

export default mongoose.model("PackageGroup", PackageGroup);
