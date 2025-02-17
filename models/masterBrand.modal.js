import mongoose from "mongoose";

const masterBrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", masterBrandSchema);
export default Brand;
