import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
