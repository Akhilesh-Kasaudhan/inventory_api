import asyncHandler from "express-async-handler";
import Sale from "../models/sales.model.js";
import Medicine from "../models/medicine.model.js";
import mongoose from "mongoose";

export const createSale = asyncHandler(async (req, res) => {
  try {
    const {
      buyersName,
      gstNumber,
      buyersDL,
      buyersPhn,
      buyersAdd, // { pincode, city, state, localAdd }
      email,
      medicines,
      gstPercentage,
    } = req.body;

    // Validate required address fields
    if (
      !buyersAdd ||
      !buyersAdd.pincode ||
      !buyersAdd.city ||
      !buyersAdd.state ||
      !buyersAdd.localAdd
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Buyer's full address (pincode, city, state, localAdd) is required.",
      });
    }

    if (!medicines || medicines.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Medicines are required." });
    }

    // Validate and check medicine details
    const processedMedicines = await Promise.all(
      medicines.map(async (medicine) => {
        const medicineData = await Medicine.findById(medicine.medicineId);
        if (!medicineData) {
          throw new Error(`Medicine '${medicine.name}' not found.`);
        }
        return {
          ...medicine, // Keep all submitted details
          medicineId: medicine.medicineId,
        };
      })
    );
    const subTotal = processedMedicines.reduce(
      (acc, med) => acc + med.sellingPrice * med.quantity,
      0
    );
    const gstTotal = (subTotal * gstPercentage) / 100;
    const grandTotal = subTotal + gstTotal;

    const sale = new Sale({
      buyersName,
      gstNumber: gstNumber || null,
      buyersDL: buyersDL || null,
      buyersPhn,
      buyersAdd, // Now an object
      email,
      medicines: processedMedicines,
      gstPercentage,
      subTotal,
      gstTotal,
      grandTotal,
    });

    await sale.save();
    return res
      .status(201)
      .json({ success: true, message: "Sale recorded successfully", sale });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch all sales
export const getSales = asyncHandler(async (req, res) => {
  try {
    const sales = await Sale.find().populate(
      "medicines",
      "name ,brand ,type ,quantity ,expiryDate ,price ,mrp"
    );
    return res.status(200).json({ success: true, sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
export const getPurchasesByBuyer = asyncHandler(async (req, res) => {
  try {
    const { buyersName, gstNumber } = req.query;
    if (!buyersName && !gstNumber)
      return res.status(400).json({
        success: false,
        message: "Provide Buyer's Name or GST Number.",
      });
    const query = {};
    if (buyersName) query.buyersName = new RegExp(`^${buyersName}$`, "i");
    if (gstNumber) query.gstNumber = gstNumber;
    const sales = await Sale.find(query).populate(
      "medicines",
      "name brand type quantity expiryDate price mrp"
    );
    if (!sales.length)
      return res
        .status(404)
        .json({ success: false, message: "No purchase records found." });

    return res.status(200).json({ success: true, purchases: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const getPurchaseById = asyncHandler(async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      "medicines",
      "name brand type quantity expiryDate price mrp"
    );
    if (!sale)
      return res.status(404).json({
        success: false,
        message: "No purchase record found.",
      });

    res.status(200).json({ success: true, purchases: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateUserPurchase = asyncHandler(async (req, res) => {
  try {
    const { saleId, newMedicines } = req.body;

    if (!saleId) {
      return res.status(400).json({
        success: false,
        message: "Sale ID is required.",
      });
    }

    if (!newMedicines?.length) {
      return res.status(400).json({
        success: false,
        message: "Provide valid medicine details.",
      });
    }

    let sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "No purchase record found.",
      });
    }

    // Validate new medicines
    let medicineIds = [];
    let newSubTotal = 0;

    for (let medicineId of newMedicines) {
      if (!mongoose.Types.ObjectId.isValid(medicineId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid medicine ID: ${medicineId}`,
        });
      }

      const medicineData = await Medicine.findById(medicineId);

      if (!medicineData) {
        return res.status(400).json({
          success: false,
          message: `Medicine with ID '${medicineId}' not found.`,
        });
      }

      medicineIds.push(medicineData._id);
      newSubTotal += medicineData.price * (medicineData.quantity || 1);
    }

    // Validate new medicines
    sale.medicines = medicineIds;
    sale.subTotal = newSubTotal;
    sale.gstTotal = (newSubTotal * sale.gstPercentage) / 100;
    sale.grandTotal = sale.subTotal + sale.gstTotal;

    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale updated successfully.",
      sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
