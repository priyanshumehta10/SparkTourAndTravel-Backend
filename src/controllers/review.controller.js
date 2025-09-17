// controllers/review.controller.js
import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";

export const createReview = async (req, res) => {
  try {
    const { username, message, star } = req.body;

    if (!username || !message || !star) {
      return res.status(400).json({ message: "Username, message, and star rating are required" });
    }

    let image = null;
    if (req.file) {
      // Upload image using Cloudinary upload_stream
      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "reviews", timeout: 60000 }, // 60 seconds timeout
            (error, result) => {
              if (error) return reject(error);
              resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      };

      image = await uploadToCloudinary(req.file);
    }

    const review = new Review({
      username,
      message,
      star,
      image,
    });

    await review.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get All Reviews
export const getReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // default 10, can pass ?limit=5
    const reviews = await Review.find()
      .sort({ createdAt: -1 }) // latest first
      .limit(limit);    
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
