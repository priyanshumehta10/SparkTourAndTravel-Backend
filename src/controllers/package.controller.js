import Package from "../models/Package.js";

// Create a new package (admin only)
export const createPackage = async (req, res) => {
  try {
    const { title, description, price, discount, duration, itinerary } = req.body;

    if (!title || !price || !duration) {
      return res.status(400).json({ message: "Title, price, and duration are required" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5)
        return res.status(400).json({ message: "Maximum 5 images allowed" });

      images = req.files.map((file) => ({
        data: file.buffer,          // multer memory storage
        contentType: file.mimetype,
      }));
    }

    const pkg = new Package({
      title,
      description,
      price,
      discount,
      duration,
      images,
      itinerary,
      createdBy: req.user.id,
    });

    await pkg.save();
    res.status(201).json(pkg);
  } catch (err) {
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
    const { title, description, price, discount, duration, itinerary } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (discount) updateData.discount = Number(discount);
    if (duration) updateData.duration = duration;

    // Recalculate finalPrice
    if (price || discount) {
      const newPrice = Number(price) || 0;
      const newDiscount = Number(discount) || 0;
      updateData.finalPrice = newPrice - (newPrice * newDiscount) / 100;
    }

    // Parse itinerary if sent as string
    if (itinerary) {
      try {
        updateData.itinerary = typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
      } catch {
        return res.status(400).json({ message: "Invalid itinerary format" });
      }
    }

    // Handle uploaded images (store in DB as buffer or base64)
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }
      // Save images as buffer in DB
      updateData.images = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname
      }));
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

