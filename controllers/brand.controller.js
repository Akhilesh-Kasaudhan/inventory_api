import asyncHandler from "express-async-handler";
import Brand from "../models/masterBrand.modal.js";
import mongoose from "mongoose";

export const addBrandName = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { brandName } = req.body;
  if (!brandName) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }
  try {
    const newBrand = await Brand.create({ brandName });
    return res
      .status(201)
      .json({ message: "BrandName added successfully", newBrand });
  } catch (error) {
    console.log("Error adding brandName:", error.message);
    res.status(500).json({ message: "Failed to add brandName" });
  }
});

export const getBrandName = asyncHandler(async (req, res) => {
  try {
    const brandName = await Brand.find().sort({ createdAt: -1 });
    return res.status(200).json({ brandName: brandName });
  } catch (error) {
    console.log("Error getting all brandName:", error.message);
    return res.status(500).json({ message: "Failed to get all brandName" });
  }
});

export const updateBrandName = asyncHandler(async (req, res) => {
  const { newBrand } = req.body;
  const { id } = req.params;
  try {
    const updatedBrandName = await Brand.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) }, // Find by id and type
      { brandName: newBrand }, // Update the type with the new value
      { new: true } // Return the updated document
    );

    if (updatedBrandName) {
      return res.status(200).json(updatedBrandName);
    } else {
      return res.status(404).json({ message: "No brand name found" });
    }
  } catch (error) {
    console.log("Error updating medicine type:", error.message);
    res.status(500).json({ message: "Failed to update medicine type" });
  }
});

export const deleteBrandName = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const deletedBrandName = await Brand.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (deletedBrandName) {
      return res.status(200).json(deletedBrandName);
    } else {
      return res.status(404).json({ message: "No brand name found" });
    }
  } catch (error) {
    console.log("Error deleting brand name:", error.message);
    res.status(500).json({ message: "Failed to delete brand name" });
  }
});
