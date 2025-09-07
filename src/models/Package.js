import mongoose from "mongoose";

const TAGS_ENUM = [
  "Popular Destinations",
  "Seasonal Specials",
  "Family-Friendly Tours",
  "Adventure & Treks",
  "Couples & Honeymoon",
  "Budget Friendly Options",
];

const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },

  // Meals & stay
  breakfast: { type: Boolean, default: false },
  lunch: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false },
  highTea: { type: Boolean, default: false },
  stay: { type: String, default: "" }, // e.g., "Hotel", "Resort", "Camp"
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

  tourInclusions: { type: String, default: "" },
  tourExclusions: { type: String, default: "" },

  // NEW: Pricing type
  pricingType: { 
    type: String, 
    enum: ["perPerson", "couple"], 
    default: "perPerson" 
  },

  group: { type: mongoose.Schema.Types.ObjectId, ref: "PackageGroup", default: null },
  Hot: { type: Boolean, default: false },
  itinerary: [itinerarySchema],
  bookingsCount: { type: Number, default: 0 },
  tags: {
    type: [String],
    enum: TAGS_ENUM,
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"], // Max 5 tags per package
    default: [],
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// Add indexes to improve query speed
packageSchema.index({ Hot: -1, createdAt: -1 }); 
packageSchema.index({ tags: 1 });


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

export const PACKAGE_TAGS = TAGS_ENUM;

export default mongoose.model("Package", packageSchema);
