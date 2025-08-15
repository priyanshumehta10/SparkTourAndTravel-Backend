import Inquiry from "../models/Inquiry.js";

// Create Inquiry
export const createInquiry = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNumber, message } = req.body;

        const newInquiry = new Inquiry({
            firstName,
            lastName,
            email,
            mobileNumber,
            message
        });

        await newInquiry.save();

        res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully",
            data: newInquiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Inquiries
export const getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Inquiry
export const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: "Inquiry not found" });
        }
        res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
