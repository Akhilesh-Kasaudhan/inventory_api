import asyncHandler from "express-async-handler";
import Sale from "../models/sales.model.js";
import Medicine from "../models/medicine.model.js";

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

    // Validate and populate medicine details
    for (let i = 0; i < medicines.length; i++) {
      let medicine = medicines[i];

      if (!medicine.medicineType || !medicine.brand || !medicine.expiryDate) {
        const medicineData = await Medicine.findOne({ name: medicine.name });

        if (!medicineData) {
          return res.status(400).json({
            success: false,
            message: `Medicine '${medicine.name}' not found in database.`,
          });
        }

        if (
          !medicine.sellingPrice ||
          medicine.sellingPrice > medicineData.mrp ||
          medicine.sellingPrice < medicineData.price
        ) {
          return res.status(400).json({
            success: false,
            message: `Selling price of '${medicine.name}' must be between purchase price and MRP.`,
          });
        }

        medicines[i] = medicineData._id;
      }
    }

    const subTotal = medicines.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
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
      medicines,
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
    const sales = await Sale.find();
    return res
      .status(200)
      .json({ success: true, Sales: sales, medicine: sales.medicines });
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
    const sales = await Sale.find(query).populate("medicines");
    if (!sales.length)
      return res
        .status(404)
        .json({ success: false, message: "No purchase records found." });
    res.status(200).json({ success: true, purchases: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const getPurchaseById = asyncHandler(async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("medicines");
    if (!sale)
      return res.status(404).json({
        success: false,
        message: "No purchase record found.",
      });

    res
      .status(200)
      .json({ success: true, purchases: sale, medicine: sale.medicines });
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
    for (let medicine of newMedicines) {
      const medicineData = await Medicine.findOne({ name: medicine.name });
      if (!medicineData) {
        return res.status(400).json({
          success: false,
          message: `Medicine '${medicine.name}' not found.`,
        });
      }
      medicine.medicineType = medicineData.type;
      medicine.brand = medicineData.brand;
    }

    // Replace existing medicines with new medicines
    sale.medicines = newMedicines;

    // Recalculate totals
    sale.subTotal = newMedicines.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    sale.gstTotal = (sale.subTotal * sale.gstPercentage) / 100;
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
