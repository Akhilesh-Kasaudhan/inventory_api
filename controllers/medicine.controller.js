import asyncHandler from "express-async-handler";
import Medicine from "../models/medicine.model.js";
import Master from "../models/masterMedicine.model.js";
import mongoose from "mongoose";
import Brand from "../models/masterBrand.modal.js";

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
    return res.status(200).json({ medicineType: { medicineTypes } });
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
      { type: newType }, // Update the type with the new value
      { new: true, returnOriginal: false } // Return the updated document
    );

    if (updatedMedicineType) {
      return res.status(200).json({ updatedType: updatedMedicineType });
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
    const { name, brand, type, quantity, expiryDate, price, mrp } = req.body;
    const brandExist = await Brand.findOne({ brandName: brand });
    if (!brandExist) {
      return res.status(404).json({ mesage: "Brand not found" });
    }
    const typeExist = await Master.findOne({ medicineType: type });
    if (!typeExist) {
      return res.status(404).json({ mesage: "Type not found" });
    }
    const medicine = new Medicine({
      name,
      brand: brandExist._id,
      type: typeExist._id,
      quantity,
      expiryDate,
      price,
      mrp,
    });
    await medicine.save();
    return res.status(201).json(medicine);
  } catch (error) {
    console.log("Error adding product:", error.message);
    res.status(400).json({ message: error.message });
  }
});

export const getMedicines = asyncHandler(async (req, res) => {
  try {
    const medicines = await Medicine.aggregate([
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      { $unwind: "$brandDetails" },
      {
        $lookup: {
          from: "masters",
          localField: "type",
          foreignField: "_id",
          as: "typeDetails",
        },
      },
      { $unwind: "$typeDetails" },
      {
        $project: {
          name: 1,
          brand: "$brandDetails.brandName",
          type: "$typeDetails.medicineType",
          quantity: 1,
          expiryDate: 1,
          price: 1,
          mrp: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Medicine fetched successfully:", medicines });
  } catch (error) {
    console.log("Error fetching medicines:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export const updateMedicine = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, type, quantity, expiryDate, price, mrp } = req.body;

    // Find the existing medicine
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // If brand is updated, check if it exists
    let brandId = medicine.brand; // Default to existing brand
    if (brand) {
      const brandExist = await Brand.findOne({ brandName: brand });
      if (!brandExist) {
        return res.status(404).json({ message: "Brand not found" });
      }
      brandId = brandExist._id;
    }

    // If type is updated, check if it exists
    let typeId = medicine.type; // Default to existing type
    if (type) {
      const typeExist = await Master.findOne({ medicineType: type });
      if (!typeExist) {
        return res.status(404).json({ message: "Type not found" });
      }
      typeId = typeExist._id;
    }

    // Update medicine details
    medicine.name = name || medicine.name;
    medicine.brand = brandId;
    medicine.type = typeId;
    medicine.quantity = quantity || medicine.quantity;
    medicine.expiryDate = expiryDate || medicine.expiryDate;
    medicine.price = price || medicine.price;
    medicine.mrp = mrp || medicine.mrp;

    // Save the updated medicine
    const updatedMedicine = await medicine.save();

    return res.status(200).json({
      message: "Medicine updated successfully",
      medicine: updatedMedicine,
    });
  } catch (error) {
    console.log("Error updating medicine:", error.message);
    res.status(500).json({ error: error.message });
  }
});
