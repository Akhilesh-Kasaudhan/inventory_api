import asyncHandler from "express-async-handler";
import Medicine from "../models/medicine.model.js";
import Master from "../models/masterMedicine.model.js";
import mongoose from "mongoose";

export const addMedicineType = asyncHandler(async (req, res) => {
  const { type } = req.body;
  if (!type) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }
  try {
    const newType = await Master.create({ medicineType: type });
    return res
      .status(201)
      .json({ message: "MedicineType added successfully", newType });
  } catch (error) {
    console.log("Error adding MedicineType:", error.message);
    res.status(500).json({ message: "Failed to add MedicineType" });
  }
});

export const getAllMedicineType = asyncHandler(async (req, res) => {
  try {
    const medicineTypes = await Master.find().sort({ createdAt: -1 });
    return res.status(200).json({ medicineTypes });
  } catch (error) {
    console.log("Error getting all MedicineType:", error.message);
    return res.status(500).json({ message: "Failed to get all MedicineType" });
  }
});

export const updateMedicineType = asyncHandler(async (req, res) => {
  const { newType } = req.body;
  const { id } = req.params;
  try {
    const updatedMedicineType = await Master.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) }, // Find by id and type
      { medicineType: newType }, // Update the type with the new value
      { new: true } // Return the updated document
    );

    if (updatedMedicineType) {
      return res.status(200).json(updatedMedicineType);
    } else {
      return res.status(404).json({ message: "No medicine type found" });
    }
  } catch (error) {
    console.log("Error updating medicine type:", error.message);
    res.status(500).json({ message: "Failed to update medicine type" });
  }
});

export const deleteMedicineType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const deletedMedicineType = await Master.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (deletedMedicineType) {
      return res.status(200).json(deletedMedicineType);
    } else {
      return res.status(404).json({ message: "No medicine type found" });
    }
  } catch (error) {
    console.log("Error deleting medicine type:", error.message);
    res.status(500).json({ message: "Failed to delete medicine type" });
  }
});

export const addMedicine = asyncHandler(async (req, res) => {
  try {
    const { name, brand, price, expiryDate, stock, description, type } =
      req.body;
    const medicine = new Medicine({
      name,
      brand,
      price,
      expiryDate,
      stock,
      description,
      type,
    });
    const savedMedicine = await medicine.save();
    res
      .status(201)
      .json({ message: "Medicine added successfully", savedMedicine });
  } catch (error) {
    console.log("Error adding product:", error.message);
    res.status(400).json({ message: error.message });
  }
});

export const getAllMedicines = asyncHandler(async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const getMedicineById = asyncHandler(async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      res.status(404).json({ message: "Medicine not found" });
    }
    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
