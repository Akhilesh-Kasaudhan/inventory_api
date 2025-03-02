import express from "express";
import {
  addVendor,
  deleteVendor,
  getVendors,
  updateVendor,
} from "../controllers/vendor.controller.js";
const router = express.Router();

router.post("/vendors", addVendor);
router.get("/vendors", getVendors);
router.patch("/vendors/:id", updateVendor);
router.delete("/vendors/:id", deleteVendor);

export default router;
