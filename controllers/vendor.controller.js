import asyncHandler from "express-async-handler";
import Vendor from "../models/vendor.model.js";

export const addVendor = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const vendor = new Vendor({
    name,
  });
  const createdVendor = await vendor.save();
  return res.status(201).json(createdVendor);
});

export const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({});
  return res.json(vendors);
});

export const updateVendor = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const vendor = await Vendor.findById(req.params.id);
  if (vendor) {
    vendor.name = name;
    const updatedVendor = await vendor.save();
    return res.json(updatedVendor);
  } else {
    res.status(404);
    throw new Error("Vendor not found");
  }
});

export const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (vendor) {
    await Vendor.findByIdAndDelete(req.params.id);
    return res.json({ message: "Vendor removed" });
  } else {
    res.status(404);
    throw new Error("Vendor not found");
  }
});
