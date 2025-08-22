import Package from "../models/Package.js";
import cloudinary from "../config/cloudinary.js";


export const createPackage = async (req, res) => {
  try {
    const { title, description, price, discount, duration, itinerary, Hot } = req.body;

    if (!title || !price || !duration) {
      return res.status(400).json({ message: "Title, price, and duration are required" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5)
        return res.status(400).json({ message: "Maximum 5 images allowed" });

      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "packages", timeout: 60000 }, // 60 seconds timeout
            (error, result) => {
              if (error) return reject(error);
              resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      };

      images = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
    }

    const pkg = new Package({
      title,
      description,
      price,
      discount,
      duration,
      images, 
      Hot,
      itinerary,
      createdBy: req.user.id,
    });

    await pkg.save();
    res.status(201).json(pkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all packages
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find().select('-__v');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single package
export const getPackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).select('-__v');
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updatePackage = async (req, res) => {
  try {
    const { title, description, price, discount, duration, itinerary, existingImages,Hot } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (discount) updateData.discount = Number(discount);
    if (duration) updateData.duration = duration;
    if (Hot !== undefined) updateData.Hot = Hot;

    // Recalculate finalPrice
    if (price || discount) {
      const newPrice = Number(price) || 0;
      const newDiscount = Number(discount) || 0;
      updateData.finalPrice = newPrice - (newPrice * newDiscount) / 100;
    }

    // Parse itinerary if sent as string
    if (itinerary) {
      try {
        updateData.itinerary =
          typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
      } catch {
        return res.status(400).json({ message: "Invalid itinerary format" });
      }
    }

    // ✅ Start with existing images (must be array of {url, public_id})
    let images = [];
    if (existingImages) {
      try {
        images =
          typeof existingImages === "string"
            ? JSON.parse(existingImages) // if sent as stringified JSON
            : existingImages;

        if (!Array.isArray(images)) {
          return res.status(400).json({ message: "existingImages must be an array" });
        }

        // ✅ Keep only valid objects with both url & public_id
        images = images.filter(img => img.url && img.public_id);

      } catch {
        return res.status(400).json({ message: "Invalid existingImages format" });
      }
    }

    // ✅ Handle new uploads
    if (req.files && req.files.length > 0) {
      if (req.files.length + images.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }

      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "packages", timeout: 60000 },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      };

      const uploaded = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
      images = [...images, ...uploaded];
    }

    if (images.length > 0) {
      updateData.images = images; // ✅ always [{url, public_id}]
    }

    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!pkg) return res.status(404).json({ message: "Package not found" });

    res.status(200).json({ message: "Package updated successfully", package: pkg });
  } catch (err) {
    console.error("Update package error:", err);
    res.status(500).json({ message: "Server error while updating package" });
  }
};





// Delete package (admin only)
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

