import mongoose from "mongoose";

const masterMedicineSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Master = mongoose.model("Master", masterMedicineSchema);

export default Master;
