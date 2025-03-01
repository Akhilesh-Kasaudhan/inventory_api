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
      pincode: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      localAdd: { type: String, required: true },
    },
    email: {
      type: String,
      required: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        medicineType: { type: String, required: true },
        quantity: { type: Number, required: true },
        expiryDate: { type: String, required: true },
        sellingPrice: { type: Number, required: true },
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
