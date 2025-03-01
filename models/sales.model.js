import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    buyersName: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
    },
    buyersDL: {
      type: String,
    },
    buyersPhn: {
      type: Number,
      required: true,
    },
    buyersAdd: {
      localAdd: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    email: {
      type: String,
      required: true,
    },
    medicines: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }, // Reference to Medicine model
        name: { type: String, required: true }, // Store medicine name
        brand: { type: String, required: true }, // Store medicine brand
        medicineType: { type: String, required: true }, // Store medicine type
        quantity: { type: Number, required: true }, // Store quantity
        expiryDate: { type: String, required: true }, // Store expiry date (YYYY-MM format)
        price: { type: Number, required: true }, // Store price
        sellingPrice: { type: Number, required: true }, // Store selling price
        mrp: { type: Number, required: true }, // Store MRP
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    gstPercentage: {
      type: Number,
      default: 0,
    },
    gstTotal: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", salesSchema);

export default Sale;
