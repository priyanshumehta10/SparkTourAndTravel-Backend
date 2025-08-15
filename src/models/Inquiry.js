import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    mobileNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Please provide a valid 10-digit mobile number"]
    },
    message: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model("Inquiry", inquirySchema);
