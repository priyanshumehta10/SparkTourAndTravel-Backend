import mongoose from "mongoose";

const PackageGroup = new mongoose.Schema({
  name: { type: String, required: true },
  photo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PackageGroup", PackageGroup);
