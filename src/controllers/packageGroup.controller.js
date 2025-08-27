import PackageGroup from "../models/PackageGroup.js";
import Package from "../models/Package.js";
import cloudinary from "../config/cloudinary.js";

export const createPackageGroup = async (req, res) => {
  try {
    const { name, packageIds } = req.body;

    if (!name) return res.status(400).json({ message: "Group name is required" });

    let photo = null;

    // Upload photo if provided
    if (req.file) {
      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "packageGroups", timeout: 60000 },
            (error, result) => {
              if (error) return reject(error);
              resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      };

      photo = await uploadToCloudinary(req.file);
    } else {
      return res.status(400).json({ message: "Group photo is required" });
    }

    // Validate package IDs
    let validPackages = [];
    if (packageIds && packageIds.length > 0) {
      validPackages = await Package.find({ _id: { $in: packageIds } }).select("_id");
    }

    const group = new PackageGroup({
      name,
      photo,
      packages: validPackages.map(p => p._id),
      createdBy: req.user.id,
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating package group" });
  }
};


// Get all package groups
export const getPackageGroups = async (req, res) => {
  try {
    const groups = await PackageGroup.find()
      .populate("packages")
      .select("-__v");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single package group
export const getPackageGroup = async (req, res) => {
  try {
    const group = await PackageGroup.findById(req.params.id).populate("packages");
    if (!group) return res.status(404).json({ message: "Package group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update package group (name, photo, packages)
export const updatePackageGroup = async (req, res) => {
  try {
    const { name, existingPhoto } = req.body;
    const updateData = {};

    if (name) updateData.name = name;

    // ✅ Start with existing photo (must be {url, public_id})
    let photo = null;
    if (existingPhoto) {
      try {
        const parsed =
          typeof existingPhoto === "string" ? JSON.parse(existingPhoto) : existingPhoto;

        if (parsed && parsed.url && parsed.public_id) {
          photo = parsed; // keep old photo
        }
      } catch {
        return res.status(400).json({ message: "Invalid existingPhoto format" });
      }
    }

    // ✅ Handle new upload (overwrite photo if new file uploaded)
    if (req.file) {
      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "packageGroups", timeout: 60000 },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      };

      photo = await uploadToCloudinary(req.file);
    }

    if (photo) {
      updateData.photo = photo; // always {url, public_id}
    }

console.log("id :", req.params.id);

    const group = await PackageGroup.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!group) return res.status(404).json({ message: "Package group not found" });

    res.json({ message: "Package group updated successfully", group });
  } catch (err) {
    console.error("Update package group error:", err);
    res.status(500).json({ message: "Server error while updating package group" });
  }
};


// Delete package group
export const deletePackageGroup = async (req, res) => {
  try {
    const group = await PackageGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: "Package group not found" });
    res.json({ message: "Package group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
