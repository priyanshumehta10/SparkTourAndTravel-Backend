import Package from "../models/Package.js";
import cloudinary from "../config/cloudinary.js";
import { PACKAGE_TAGS } from "../models/Package.js";


export const createPackage = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount,
      specialDiscount,
      duration,
      itinerary,
      Hot,
      groupId,
      tags,
      tourInclusions,
      tourExclusions,
      pricingType, // 👈 new field
    } = req.body;

    if (!title || !price || !duration) {
      return res
        .status(400)
        .json({ message: "Title, price, and duration are required" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res
          .status(400)
          .json({ message: "Maximum 5 images allowed" });
      }

      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "packages", timeout: 60000 },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );
          stream.end(file.buffer);
        });
      };

      images = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file))
      );
    }
    const pkg = new Package({
      title,
      description,
      price,
      discount,
      specialDiscount,
      duration,
      images,
      Hot,
      itinerary: typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary || [],
      tourInclusions: tourInclusions || "",
      tourExclusions: tourExclusions || "",
      pricingType: pricingType || "perPerson",
      createdBy: req.user.id,
      group: groupId || null,
      tags: Array.isArray(tags) ? tags : (typeof tags === "string" ? JSON.parse(tags) : []),
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
    const { limit, tag } = req.query;

    const query = {};
    if (tag) {
      query.tags = tag; // filter by tag if provided
    }

    const packages = await Package.find(query)
      .select("title price finalPrice duration images tags Hot createdAt discount") // only required fields
      .sort({ Hot: -1, createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean(); // faster, returns plain JS objects

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
    const {
      title,
      description,
      price,
      discount,
      specialDiscount,
      duration,
      itinerary,
      existingImages,
      Hot,
      groupId,
      tourInclusions,
      tourExclusions,
      pricingType, // 👈 new field
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (discount) updateData.discount = Number(discount);
    if (specialDiscount) updateData.specialDiscount = Number(specialDiscount);
    if (duration) updateData.duration = duration;
    if (Hot !== undefined) updateData.Hot = Hot;
    if (groupId !== undefined) updateData.group = groupId;

    // ✅ New fields
    if (tourInclusions !== undefined) updateData.tourInclusions = tourInclusions;
    if (tourExclusions !== undefined) updateData.tourExclusions = tourExclusions;
    if (pricingType !== undefined) {
      if (!["perPerson", "couple"].includes(pricingType)) {
        return res.status(400).json({ message: "Invalid pricingType value" });
      }
      updateData.pricingType = pricingType;
    }

    // ✅ Recalculate finalPrice
    if (price || discount) {
      const newPrice = Number(price) || 0;
      const newDiscount = Number(discount) || 0;
      updateData.finalPrice =
        newPrice - (newPrice * newDiscount) / 100;
    }

        if (specialDiscount) {
      const newSpecialPrice = Number(price) || 0;
      const newSpecialDiscount = Number(specialDiscount) || 0;
      updateData.finalSpecialPrice =
        newSpecialPrice - (newSpecialPrice * newSpecialDiscount) / 100;
    }

    // ✅ Handle tags
    if (req.body.tags) {
      try {
        updateData.tags =
          typeof req.body.tags === "string"
            ? JSON.parse(req.body.tags)
            : req.body.tags;
      } catch {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }

    // ✅ Handle itinerary (parse if JSON string)
    if (itinerary) {
      try {
        updateData.itinerary =
          typeof itinerary === "string"
            ? JSON.parse(itinerary)
            : itinerary;
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
            ? JSON.parse(existingImages)
            : existingImages;

        if (!Array.isArray(images)) {
          return res
            .status(400)
            .json({ message: "existingImages must be an array" });
        }

        // Keep only valid objects
        images = images.filter((img) => img.url && img.public_id);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid existingImages format" });
      }
    }

    // ✅ Handle new uploads
    if (req.files && req.files.length > 0) {
      if (req.files.length + images.length > 5) {
        return res
          .status(400)
          .json({ message: "Maximum 5 images allowed" });
      }

      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "packages", timeout: 60000 },
            (error, result) => {
              if (error) reject(error);
              else
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
            }
          );
          stream.end(file.buffer);
        });
      };

      const uploaded = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file))
      );
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

    if (!pkg)
      return res.status(404).json({ message: "Package not found" });

    res
      .status(200)
      .json({ message: "Package updated successfully", package: pkg });
  } catch (err) {
    console.error("Update package error:", err);
    res
      .status(500)
      .json({ message: "Server error while updating package" });
  }
};




export const getAllTags = async (req, res) => {
  try {
    res.json(PACKAGE_TAGS);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tags" });
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


export const getPackagesByGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    if (!groupId) return res.status(400).json({ message: "Package group ID is required" });

    const packages = await Package.find({ group: groupId }).select("-__v");

    if (!packages || packages.length === 0) {
      return res.status(404).json({ message: "No packages found for this group" });
    }

    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching packages by group" });
  }
};