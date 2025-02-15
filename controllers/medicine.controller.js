import asyncHandler from "express-async-handler";
import Medicine from "../models/medicine.model.js";
import Master from "../models/masterMedicine.model.js";

export const addBrand = asyncHandler(async (req, res) => {
  const { brand, type } = req.body;
  try {
    if (!brand || !type) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const newBrand = await Master.create({ brand, type });
    const savedNewBrand = await newBrand.save();
    res
      .status(201)
      .json({ message: "Brand added successfully", savedNewBrand });
  } catch (error) {
    console.log("Error adding brand:", error.message);
    res.status(500).json({ message: "Failed to add brand" });
  }
});

export const masterRoute = asyncHandler(async (req, res) => {
  const { brand, type } = req.body;
  try {
    const masterMedicine = await Master.findOne({ brand: brand, type: type });
    if (masterMedicine) {
      res.json(masterMedicine);
    } else {
      res.status(404).json({ message: "No master medicine found" });
    }
  } catch (error) {}
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
