import mongoose from "mongoose";

const masterMedicineSchema = new mongoose.Schema(
  {
    medicineType: {
      type: String,
    },
  },
  { timestamps: true }
);

const Master = mongoose.model("Master", masterMedicineSchema);

export default Master;
