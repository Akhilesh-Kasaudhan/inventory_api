import asyncHandler from "express-async-handler";
import Sale from "../models/sales.model.js";

export const createSale = asyncHandler(async (req, res) => {
  try {
    const { buyersName, gstNumber, buyersAdd, medicines, gstPercentage } =
      req.body;

    //calculate Totals
    const subTotal = medicines.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    const gstTotal = (subTotal * gstPercentage) / 100;
    const grandTotal = subTotal + gstTotal;

    const sale = new Sale({
      buyersName,
      gstNumber: gstNumber || null,
      buyersAdd,
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
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const getSales = asyncHandler(async (req, res) => {
  try {
    const sales = await Sale.find();
    return res.status(200).json({ success: true, sales });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get personal purchase details
export const getUserPurchases = async (req, res) => {
  try {
    let { buyersName, gstNumber } = req.query; // Get query params

    if (!buyersName && !gstNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide either buyersName or gstNumber.",
      });
    }

    // Ensure spaces are correctly handled
    if (buyersName) {
      buyersName = buyersName.replace(/\+/g, " "); // Convert "+" to spaces
    }
    // if (buyersName) {
    //   buyersName = decodeURIComponent(buyersName);
    // }

    // Find sales by buyersName or GST Number
    const query = {};
    if (buyersName) {
      query.buyersName = { $regex: new RegExp("^" + buyersName + "$", "i") }; // Case-insensitive exact match
    }
    if (gstNumber) query.gstNumber = gstNumber;

    const purchases = await Sale.find(query);

    if (purchases.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No purchase records found." });
    }

    return res.status(200).json({ success: true, purchases });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update purchase: Add more medicines to an existing sale
export const updateUserPurchase = async (req, res) => {
  try {
    const { buyersName, gstNumber, newMedicines } = req.body;

    if (!buyersName && !gstNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide either buyersName or gstNumber.",
      });
    }

    if (
      !newMedicines ||
      !Array.isArray(newMedicines) ||
      newMedicines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid medicine details.",
      });
    }

    // Find the sale by userName or gstNumber
    const query = {};
    if (buyersName) query.buyersName = buyersName;
    if (gstNumber) query.gstNumber = gstNumber;

    let sale = await Sale.findOne(query).sort({ createdAt: -1 });
    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "No purchase record found." });
    }

    // Ensure `medicineType` and `brand` are set
    for (let i = 0; i < newMedicines.length; i++) {
      const medicine = newMedicines[i];

      if (!medicine.medicineType || !medicine.brand) {
        const medicineData = await Medicine.findOne({ name: medicine.name });

        if (!medicineData) {
          return res.status(400).json({
            success: false,
            message: `Medicine '${medicine.name}' not found in database.`,
          });
        }

        newMedicines[i].medicineType = medicineData.type;
        newMedicines[i].brand = medicineData.brand;
      }
    }

    // Add new medicines to the existing list
    sale.medicines.push(...newMedicines);

    // Recalculate totals
    const subTotal = sale.medicines.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    const gstAmount = (subTotal * sale.gstPercentage) / 100;
    const grandTotal = subTotal + gstAmount;

    sale.subTotal = subTotal;
    sale.gstTotal = gstAmount;
    sale.grandTotal = grandTotal;

    await sale.save();

    return res
      .status(200)
      .json({ success: true, message: "Medicines added successfully", sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



