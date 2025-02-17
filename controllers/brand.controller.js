import asyncHandler from "express-async-handler";
import Brand from "../models/masterBrand.modal.js";

export const addBrandName = asyncHandler(async (req, res) => {
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
    return res.status(200).json({ brandName });
  } catch (error) {
    console.log("Error getting all brandName:", error.message);
    return res.status(500).json({ message: "Failed to get all brandName" });
  }
});

export const updateBrandName = asyncHandler(async (req, res) => {
  try {
  } catch (error) {}
});

export const deleteBrandName = asyncHandler(async (req, res) => {
  try {
  } catch (error) {}
});
