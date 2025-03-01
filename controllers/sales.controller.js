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
          medicineId: new mongoose.Types.ObjectId(medicine.medicineId), // ✅ Convert string ID to ObjectId
          name: medicine.name,
          brand: medicine.brand,
          medicineType: medicine.medicineType,
          quantity: medicine.quantity,
          expiryDate: medicine.expiryDate,
          price: medicine.price,
          sellingPrice: medicine.sellingPrice,
          mrp: medicine.mrp,
        };
      })
    );
    const subTotal = processedMedicines.reduce(
      (acc, med) => acc + med.sellingPrice * med.quantity,
      0
    );
    const gstTotal = (subTotal * (gstPercentage || 0)) / 100;
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

    console.log("newMedicines", newMedicines);

    // Validate saleId
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sale ID.",
      });
    }

    // Find the sale record
    let sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "No purchase record found.",
      });
    }

    // Validate new medicines and fetch their details
    let updatedMedicines = [];
    let newSubTotal = 0;

    for (let medicine of newMedicines) {
      // Validate medicineId
      if (!mongoose.Types.ObjectId.isValid(medicine.medicineId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid medicine ID: ${medicine.medicineId}`,
        });
      }

      // Fetch medicine details from the database
      const medicineData = await Medicine.findById(medicine.medicineId);

      if (!medicineData) {
        return res.status(400).json({
          success: false,
          message: `Medicine with ID '${medicine.medicineId}' not found.`,
        });
      }

      // Construct the medicine object with all required fields
      const updatedMedicine = {
        medicineId: new mongoose.Types.ObjectId(medicine.medicineId), // Ensure ObjectId
        name: medicineData.name,
        brand: medicineData.brand,
        medicineType: medicineData.type,
        quantity: medicine.quantity,
        expiryDate: medicineData.expiryDate,
        price: medicineData.price,
        sellingPrice: medicine.sellingPrice,
        mrp: medicineData.mrp,
      };

      updatedMedicines.push(updatedMedicine);

      // Calculate subtotal
      newSubTotal += medicineData.price * (medicine.quantity || 1);
    }
    console.log("Updated Medicines:", updatedMedicines);

    // Update sale record
    sale.medicines = updatedMedicines; // Update medicines array
    sale.subTotal = newSubTotal; // Update subtotal
    sale.gstTotal = (newSubTotal * sale.gstPercentage) / 100; // Update GST total
    sale.grandTotal = sale.subTotal + sale.gstTotal; // Update grand total

    // Save the updated sale record
    await sale.save();

    // Populate medicines for the response
    const updatedSale = await Sale.findById(saleId).populate(
      "medicines.medicineId",
      "name brand type expiryDate price mrp"
    );

    res.status(200).json({
      success: true,
      message: "Sale updated successfully.",
      sale: updatedSale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
